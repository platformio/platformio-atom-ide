'use babel';

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as config from '../config';
import * as utils from '../utils';

import { getActivePioProject, isPioProject } from '../project/util';

import {InitializeNewProjectView} from './view';
import child_process from 'child_process';
import ini from 'ini';
import path from 'path';
import promisify from 'promisify-node';

const fsp = promisify('fs');


const __TYPE_FILE = 'file';
const __TYPE_DIR = 'dir';
let __ALL_LIB_WATCHERS = new Map();
let __INTENSIONS_CACHE = new Map();

export function cleanMiscCache() {
  __ALL_LIB_WATCHERS = null;
  __INTENSIONS_CACHE = null;

}

export function command() {
  // Initialize view
  var view = new InitializeNewProjectView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  // Set buttons handlers
  view.handleCancel = () => panel.destroy();
  view.handleInit = () => {
    const projectPath = view.getDirectory();
    const selectedBoards = view.getSelectedBoards();
    return installPlatformsForBoards(selectedBoards, view)
      .then(() => view.setStatus('Performing initialization...'))
      .then(() => initializeProject(selectedBoards, projectPath))
      .then(() => {
        atom.notifications.addSuccess('PlatformIO: Project has been successfully initialized!', {
          detail: 'The next files/directories were created in "' + projectPath + '"\n' +
          '"platformio.ini" - Project Configuration File\n' +
          '"src" - Put your source code here\n' +
          '"lib" - Put here project specific (private) libraries'
        });
        utils.runAtomCommand('build:refresh-targets');
      }, (reason) => {
        const title = 'PlatformIO: Failed to initialize PlatformIO project!';
        atom.notifications.addError(title, {detail: reason, dismissable: true});
        console.error(title);
        console.error(reason);
      })
      .then(() => {
        if (-1 === atom.project.getPaths().indexOf(projectPath)) {
          atom.project.addPath(projectPath);
        }
        handleLibChanges([projectPath]);
      })
      .then(() => panel.destroy(), () => panel.destroy());
  };

  const paths = atom.project.getPaths();
  if (paths.length > 0) {
    view.addDirectories(paths, getActivePioProject());
  }
}

export function initializeProject(boardIds, projectPath) {
  const boards = utils.getBoards();
  const args = ['init', '--ide', 'atom'];
  boardIds.forEach((boardId) => {
    args.push('--board');
    if ('id' in boards[boardId]) {
      args.push(boards[boardId].id);
    }
    else {
      args.push(boardId);
    }
  });
  args.push('--project-dir');
  args.push(projectPath);

  return utils.spawnPio(args);
}

function getPlatforms(boardIds) {
  const boards = utils.getBoards();
  const result = new Set();
  for (const boardId of boardIds) {
    result.add(boards[boardId].platform);
  }
  return result;
}

export function installPlatformsForBoards(boardIds, view) {
  let p = Promise.resolve();
  for (const platform of getPlatforms(boardIds)) {
    p = p.then(_setStatus(platform))
         .then(_installPlatform(platform));
  }
  return p;

  function _setStatus(platform) {
    return function() {
      return view.setStatus(`Installing platform: ${platform}`);
    };
  }

  function _installPlatform(platform) {
    return function() {
      return utils.spawnPio(['platforms', 'install', platform]);
    };
  }
}

export async function rebuildIndex(projectPath) {
  if (!projectPath) {
    atom.notifications.addError(
      'PlatformIO: Please open the project directory.');
    return;
  }

  try {
    const iniPath = path.join(projectPath, 'platformio.ini');
    if (!await utils.isFile(iniPath)) {
      atom.notifications.addError('PlatformIO: Please initialize new project first.');
      return;
    }

    const envNamePrefix = 'env:';
    const busyId = `platformio.index-rebuild-${projectPath}`;
    const config = ini.parse((await fsp.readFile(iniPath)).toString());
    const configSections = Object.keys(config);
    let rebuildOccured = 0;

    for (const section of configSections) {
      if (section.indexOf(envNamePrefix) === 0 && config[section].board) {
        utils.beginBusy(
          busyId, `Rebuilding C/C++ Project Index for ${projectPath}`);
        const args = ['init', '--ide', 'atom', '-b', config[section].board];
        try {
          await utils.spawnPio(args, {cwd: projectPath});
          atom.notifications.addSuccess(
            'PlatformIO: C/C++ Project Index (for Autocomplete, Linter) has been successfully rebuilt.'
          );
          rebuildOccured = 1;
        } catch(e) {
          rebuildOccured = 2;
          console.error(e);
          onFail(e);
        }
        utils.endBusy(busyId);
        break;
      }
    }

    if (rebuildOccured === 0) {
      atom.notifications.addWarning(
        'PlatformIO: Rebuild operation has been skipped (empty project).'
      );
    }
  } catch(e) {
    onFail(e);
  }

  function onFail(e) {
    atom.notifications.addError(
      'PlatformIO: Failed to rebuild C/C++ Project Index (for Autocomplete, Linter).',
      {'detail': e.toString(), dismissable: true}
    );
  }

}

export function intendToPerformIndexRebuild(p, firstRun=true, recursionDepth=0) {
  if (!__INTENSIONS_CACHE.has(p)) {
    __INTENSIONS_CACHE.set(p, []);
  }
  const intensions = __INTENSIONS_CACHE.get(p);
  if (firstRun && intensions.length === 0) {
    atom.notifications.addInfo('PlatformIO: C/C++ Project Index will be rebuilt shortly.', {
      detail: `Libraries or configuration of project "${p}" have been changed. ` +
              'C/C++ Project Index (Autocomplete, Linter) will be rebuilt in order to make changes ' +
              'available in the PlatformIO IDE.',
    });
  }

  const now = Date.now();
  intensions.sort();
  if (intensions[intensions.length - 1] + config.AUTO_REBUILD_DELAY < now) {
    // No new intensions were made in last AUTO_REBUILD_DELAY ms
    intensions.splice(0, intensions.length);  // clear the array
    return rebuildIndex(p);
  } else if (firstRun) {
    intensions.push(now);
  }

  if (intensions.length > 0 && recursionDepth < 1000) {
    setTimeout(
      () => intendToPerformIndexRebuild(p, false, recursionDepth + 1),
      config.AUTO_REBUILD_DELAY
    );
  }
}

export async function ensureProjectsInited(projectPaths, force=false) {
  if (!atom.config.get('platformio-ide.autoRebuildAutocompleteIndex') && !force) {
    return;
  }

  const confFiles = ['.clang_complete', '.gcc-flags.json'];
  for (const projectPath of projectPaths) {
    try {
      const dirStat = await fsp.stat(projectPath);
      if (!dirStat || !dirStat.isDirectory()) {
        continue;
      }
      const projectFiles = await fsp.readdir(projectPath);
      if (projectFiles.indexOf('platformio.ini') === -1) {
        continue;
      }
      for (const file of confFiles) {
        if (projectFiles.indexOf(file) === -1) {
          intendToPerformIndexRebuild(projectPath);
          break;
        }
      }
    } catch(e) {
      console.warn(`An error occured while processing project under ${projectPath}: ` + e.toString());
      continue;
    }
  }
}

/**
 * Setup watches on library paths of given project paths.
 *
 * Each project has a set of watches:
 *  - on local `lib` directory;
 *  - on global `lib` directory;
 *  - on `platformio.ini`;
 *
 * When `platformio.ini` content changes, checks a global `lib` dir. If it has
 * been changed, a corresponging watch of on old dir should be disposed, and
 * a watch on new dir should be created instead.
 *
 * WIP!
 */
export function handleLibChanges(projectPaths) {
  let Directory, File;
  try {
    const pathwatcher = require(path.join(process.resourcesPath, 'app.asar', 'node_modules', 'pathwatcher'));
    Directory = pathwatcher.Directory;
    File = pathwatcher.File;
  } catch(e) {
    console.warn('Unable to import the pathwatcher module. ' +
                 'Automatic index rebuild on libraries changes will not be available.');
    return;
  }

  // Stop watching removed paths
  const currentPaths = atom.project.getPaths();
  const removedPaths = Array.from(__ALL_LIB_WATCHERS.keys()).filter(p => currentPaths.indexOf(p) === -1);
  clearLibChangeWatchers(removedPaths);

  // Update watches on open paths
  projectPaths.map(p => {
    if (!isPioProject(p)) {
      return;
    }

    if (!__ALL_LIB_WATCHERS.has(p)) {
      __ALL_LIB_WATCHERS.set(p, []);
    }
    const existingWatches = __ALL_LIB_WATCHERS.get(p);

    const necessaryWatches = [
      {
        type: __TYPE_FILE,
        path: path.join(p, 'platformio.ini'),
      }
    ];

    const warningMessage = 'Failed to get library directories for watching';
    try {
      const args = ['-c', 'from os.path import join; from platformio import VERSION,util; print ":".join([join(util.get_home_dir(), "lib"), util.get_projectlib_dir(), util.get_projectlibdeps_dir()]) if VERSION[0] == 3 else util.get_lib_dir()'];
      const child = child_process.spawnSync('python', args, {cwd: p});
      if (child.status === 0) {
        for (const libDir of child.stdout.toString().trim().split(':')) {
          necessaryWatches.push({
            type: __TYPE_DIR,
            path: libDir,
          });
        }
      } else {
        console.warn(warningMessage);
      }
    } catch(e) {
      console.warn(warningMessage);
    }

    // Dispose the watches that are not necessary anymore (e.g., when global
    // lib dir changes, the old watch has to be disposed before a new one is
    // created).
    const necessaryWathPaths = necessaryWatches.map(x => x.path);
    let i = existingWatches.length;
    while (i--) {
      // Iterating backwards in order to be able to delete the array elements
      // safely.
      const watch = existingWatches[i];
      if (!necessaryWathPaths.includes(watch.path)) {
        watch.disposable.dispose();
        existingWatches.splice(i, 1);
      }
    }

    const alreadyWatchedPaths = existingWatches.map(x => x.path);
    const watchesToAdd = necessaryWatches
      .filter(x => !alreadyWatchedPaths.includes(x.path));

    for (const watchConfig of watchesToAdd) {
      let pathwatcherInstance = null;
      switch (watchConfig.type) {

        case __TYPE_FILE:
          pathwatcherInstance = new File(watchConfig.path);
          watchConfig.disposable = pathwatcherInstance.onDidChange(() => {
            handleLibChanges([p]);
            intendToPerformIndexRebuild(p);
          });
          console.debug(`File watch added: ${watchConfig.path}`);
          break;

        case __TYPE_DIR:
          pathwatcherInstance = new Directory(watchConfig.path);
          setupLibDirWatch(watchConfig, pathwatcherInstance, p);
          console.debug(`Directory watch added: ${watchConfig.path}`);
          break;

        default:
          console.warn(
            `Incorrect watch type specified: '${watchConfig.type}'; ` +
            `whole config: ${JSON.stringify(watchConfig)}`
          );
          continue;
      }
      existingWatches.push(watchConfig);
    }
  });
}

function setupLibDirWatch(libObj, dir, projectPath) {
  if (!dir.existsSync()) {
    return;
  }

  let subdirectories = new Set();
  dir.getEntriesSync().forEach((entry) => {
    if (entry.isDirectory()) {
      subdirectories.add(entry.getPath());
    }
  });

  libObj.disposable = dir.onDidChange(() => {
    let libAdded = false;
    const currentSubdirectories = new Set();

    const entries = dir.getEntriesSync();
    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        const p = entry.getPath();
        currentSubdirectories.add(p);
        if (!subdirectories.has(p)) {
          libAdded = true;
        }
      }
    });
    subdirectories = currentSubdirectories;

    if (libAdded) {
      intendToPerformIndexRebuild(projectPath);
    }
  });
}

export function clearLibChangeWatchers(paths) {
  paths = typeof paths === 'undefined' ? atom.project.getPaths() : paths;
  for (const p of paths) {
    if (__ALL_LIB_WATCHERS.has(p)) {
      __ALL_LIB_WATCHERS.get(p).map(function(item) {
        item.path = null;
        if (item.disposable && typeof item.disposable.dispose === 'function') {
          item.disposable.dispose();
        }
        item.disposable = null;
      });
      __ALL_LIB_WATCHERS.delete(p);
    }
  }
}
