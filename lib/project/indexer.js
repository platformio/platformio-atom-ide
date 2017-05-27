/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';

import { CompositeDisposable, Directory, File } from 'atom';
import { beginBusy, endBusy } from '../services/busy';

import { AUTO_REBUILD_DELAY } from '../config';
import { getPythonExecutable } from '../installer/helpers';
import { isPioProject } from './helpers';
import path from 'path';


export default class ProjectIndexer {
  constructor(projectPath) {
    this.projectPath = projectPath;

    this.subscriptions = new CompositeDisposable();
    this.libDirWatchersSubscriptions = new Map();
    this.configFileSubscription = null;

    this.interval = null;
    this.lastRebuildRequestedAt = null;

    this.isActive = false;
  }

  async activate() {
    this.isActive = true;
    await this.setup();
  }

  deactivate() {
    this.isActive = false;
    this.subscriptions.dispose();
  }

  async setup() {
    await this.addProjectDirWatcher();
    await this.addProjectConfigWatcher();
    await this.updateLibDirsWatchers();
  }

  async addProjectDirWatcher() {
    try {
      const dir = new Directory(this.projectPath);
      if (await dir.exists()) {
        this.subscriptions.add(dir.onDidChange(() => this.addProjectConfigWatcher()));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async addProjectConfigWatcher() {
    try {
      if (this.configFileSubscription) {
        return;
      }

      const configFile = new File(path.join(this.projectPath, 'platformio.ini'));
      if (await configFile.exists()) {
        const configSubscriptions = new CompositeDisposable();
        configSubscriptions.add(configFile.onDidChange(() => {
          this.requestIndexRebuild();
          this.updateLibDirsWatchers();
        }));
        configSubscriptions.add(configFile.onDidRename(() => this.removeProjectConfigWatcher()));
        configSubscriptions.add(configFile.onDidDelete(() => this.removeProjectConfigWatcher()));
        configSubscriptions.add(configFile.onWillThrowWatchError(() => this.removeProjectConfigWatcher()));

        this.configFileSubscription = configSubscriptions;
        this.subscriptions.add(configSubscriptions);

        // Current project has been initiailzed just now or it was just opened.
        // Either way we have to make sure that indexes are up to date.
        if (atom.config.get('platformio-ide.autoRebuildAutocompleteIndex')) {
          this.requestIndexRebuild();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  removeProjectConfigWatcher() {
    if (this.configFileSubscription) {
      this.subscriptions.remove(this.configFileSubscription);
      this.configFileSubscription.dispose();
      this.configFileSubscription = null;
    }
  }

  async updateLibDirsWatchers() {
    const libDirs = await this.fetchWatchDirs();

    for (const newLibDir of libDirs.filter(libDirPath => !this.libDirWatchersSubscriptions.has(libDirPath))) {
      await this.addLibDirWatcher(newLibDir);
    }

    for (const removedLibDir of Array.from(this.libDirWatchersSubscriptions.keys()).filter(libDirPath => !libDirs.includes(libDirPath))) {
      this.removeLibDirWatcher(removedLibDir);
    }
  }

  async addLibDirWatcher(libDirPath) {
    try {
      const dir = new Directory(libDirPath);
      if (await dir.exists()) {
        const libSubscription = dir.onDidChange(() => this.requestIndexRebuild());

        this.libDirWatchersSubscriptions.set(libDirPath, libSubscription);
        this.subscriptions.add(libSubscription);
      }
    } catch (error) {
      console.error(error);
    }
  }

  removeLibDirWatcher(libDirPath) {
    const subscription = this.libDirWatchersSubscriptions.get(libDirPath);
    if (subscription) {
      this.subscriptions.remove(subscription);
      subscription.dispose();
    }
  }

  requestIndexRebuild() {
    this.lastRebuildRequestedAt = new Date();
    if (this.interval === null) {
      this.interval = setInterval(::this.maybeRebuild, AUTO_REBUILD_DELAY);
    }
  }

  async maybeRebuild() {
    const now = new Date();
    if (now.getTime() - this.lastRebuildRequestedAt.getTime() > AUTO_REBUILD_DELAY) {
      if (this.interval !== null) {
        clearInterval(this.interval);
      }
      this.interval = null;

      if (this.isActive) {
        await this.doRebuild();
      }
    }
  }

  async doRebuild({verbose = false} = {}) {
    const busyId = `platformio.index-rebuild-${this.projectPath}`;
    try {
      if (!isPioProject(this.projectPath)) {
        return;
      }

      beginBusy(busyId, `Rebuilding C/C++ Project Index for ${this.projectPath}`);

      await new Promise((resolve, reject) => {
        utils.runPIOCommand(['init', '--ide', 'atom', '--project-dir', this.projectPath], (code, stdout, stderr) => {
          if (code === 0) {
            if (verbose) {
              atom.notifications.addSuccess('PlatformIO: C/C++ Project Index (for Autocomplete, Linter) has been successfully rebuilt.');
            }
            resolve();
          } else {
            reject(stderr);
          }
        });
      });
    } catch (error) {
      utils.notifyError('C/C++ project index rebuild failed', error);
    } finally {
      endBusy(busyId);
    }
  }

  async fetchWatchDirs() {
    const pythonExecutable = await getPythonExecutable();
    const script = [
      'from os.path import join; from platformio import VERSION,util;',
      'print ":".join([',
      '    join(util.get_home_dir(), "lib"),',
      '    util.get_projectlib_dir(),',
      '    util.get_projectlibdeps_dir()',
      ']) if VERSION[0] == 3 else util.get_lib_dir()',
    ].map(s => s.trim()).join(' ');
    return new Promise((resolve, reject) => {
      utils.runCommand(
        pythonExecutable,
        ['-c', script],
        (code, stdout, stderr) => {
          if (code === 0) {
            resolve(stdout.toString().trim().split(':'));
          } else {
            reject(stderr);
          }
        },
        {
          spawnOptions: {
            cwd: this.projectPath
          }
        }
      );
    });
  }
}
