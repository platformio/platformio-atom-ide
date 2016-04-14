'use babel';

/**
 * Copyright (C) 2016 Ivan Kravets. All rights reserved.
 *
 * This source file is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import fs from 'fs';
import path from 'path';
import shell from 'shell';
import child_process from 'child_process';

import {getPythonExecutable, getIDEVersion, useBuiltinPlatformIO, getActiveProjectPath, isPioProject} from './utils';
import * as config from './config';
import {runInTerminal} from './terminal';
import {rebuildIndex} from './init/command';

export function updateOSEnviron() {
  if (useBuiltinPlatformIO()) {  // Insert bin directory into PATH
    if (process.env.PATH.indexOf(config.ENV_BIN_DIR) < 0) {
      process.env.PATH = config.ENV_BIN_DIR + path.delimiter + process.env.PATH;
    }
  } else {  // Remove bin directory from PATH
    process.env.PATH = process.env.PATH.replace(config.ENV_BIN_DIR + path.delimiter, '');
    process.env.PATH = process.env.PATH.replace(path.delimiter + config.ENV_BIN_DIR, '');
  }

  handleCustomPATH(atom.config.get('platformio-ide.customPATH'));

  process.env.PLATFORMIO_CALLER = 'atom';
  process.env.PLATFORMIO_DISABLE_PROGRESSBAR = 'true';
  process.env.PLATFORMIO_IDE = getIDEVersion();
}

export function ensureProjectsInited(projectPaths) {
  if (!atom.config.get('platformio-ide.autoRebuildAutocompleteIndex')) {
    return;
  }

  const confFiles = ['.clang_complete', '.gcc-flags.json'];
  for (const projectPath of projectPaths) {
    const dirStat = fs.statSyncNoException(projectPath);
    if (!dirStat || !dirStat.isDirectory()) {
      continue;
    }

    const projectFiles = fs.readdirSync(projectPath);
    if (projectFiles.indexOf('platformio.ini') === -1) {
      continue;
    }
    for (const file of confFiles) {
      if (projectFiles.indexOf(file) === -1) {
        rebuildIndex(projectPath);
        break;
      }
    }
  }
}

export function checkClang() {
  if (localStorage.getItem('platformio-ide:clang-checked') === '2') {
    return;
  }
  const result = child_process.spawnSync('clang', ['--version']);
  if (result.status !== 0) {
    atom.confirm({
      message: 'PlatformIO: Clang is not installed in your system!',
      detailedMessage: 'PlatformIO IDE uses "Clang" for the Intelligent Code Completion.\n' +
      'Please install it otherwise this feature will be disabled.',
      buttons: {
        'Install Clang': function() {
          shell.openExternal('http://docs.platformio.org/en/latest/ide/atom.html#ide-atom-installation-clang');
        },
        'Remind Later': function() {},
        'Disable Code Completion': function() {
          localStorage.setItem('platformio-ide:clang-checked', 2);
        }
      }
    });
  } else {
    localStorage.setItem('platformio-ide:clang-checked', 2);
  }
}

export function notifyLinterDisabledforArduino() {
  if (localStorage.getItem('platformio-ide:linter-warned') === '2') {
    return;
  }

  atom.confirm({
    message: 'PlatformIO: Smart Code Linter',
    detailedMessage: 'Smart Code Linter (checking the C/C++ code on-the-fly) ' +
    'is disabled by default for Arduino files ("*.ino" and "*.pde").\n' +
    'Please use "*.cpp" instead or enable it manually.',
    buttons: {
      'Enable': function() {
        localStorage.setItem('platformio-ide:linter-warned', 2);
        shell.openExternal('http://docs.platformio.org/en/latest/ide/atom.html#smart-code-linter-is-disabled-for-arduino-files');
      },
      'Remind Later': function() {},
      'Disable': function() {
        localStorage.setItem('platformio-ide:linter-warned', 2);
      }
    }
  });
}

export function installCommands() {
  if (config.WIN32) {
    const winCheckResult = child_process.spawnSync('platformio', ['--version']);
    if (0 !== winCheckResult.status) {
      const addResult = child_process.spawnSync(
        getPythonExecutable(),
        [path.join(config.BASE_DIR, 'misc', 'add_path_to_envpath.py'), config.ENV_BIN_DIR]);
      if (0 !== addResult.status) {
        atom.notifications.addError('PlatformIO: Failed to install PlatformIO commands!', {
          detail: addResult.stderr
        });
        console.error('' + addResult.stderr);
      } else {
        atom.notifications.addSuccess(
          'PlatformIO: Commands have been successfully installed'
        );
      }
    }
  } else {
    const args = ['-c', 'command -v platformio --version'];
    // Passing empty env, because "process.env" may contain a path to the
    // "penv/bin", which makes the check always pass.
    const options = {env: {}};
    const checkResult = child_process.spawnSync('/bin/sh', args, options);
    if (0 !== checkResult.status) {
      const map = [
        [path.join(config.ENV_BIN_DIR, 'platformio'), '/usr/local/bin/platformio'],
        [path.join(config.ENV_BIN_DIR, 'pio'), '/usr/local/bin/pio'],
      ];
      try {
        for (const item of map) {
          fs.symlinkSync(item[0], item[1]);
        }
      } catch(e) {
        let msg = 'Please install shell commands manually. Open system ' +
                  'Terminal and paste commands below:\n';
        for (const item of map) {
          msg += `\n$ sudo ln -s ${item[0]} ${item[1]}`;
        }
        atom.notifications.addError('PlatformIO: Failed to install commands', {
          detail: msg,
          dismissable: true,
        });
      }
    } else {
      atom.notifications.addInfo('PlatformIO: Shell Commands installation skipped.', {
        detail: 'Commands are already available in your shell.'
      });
    }
  }
}

export function openTerminal(cmd) {
  const status = runInTerminal([cmd]);
  if (-1 === status) {
    atom.notifications.addError('PlatformIO: Terminal service is not registered.', {
      detail: 'Make sure that "platformio-ide-terminal" package is installed.',
      dismissable: true,
    });
  }
  return status;
}

export function handleCustomPATH(newValue, oldValue) {
  if (oldValue) {
    process.env.PATH = process.env.PATH.replace(oldValue + path.delimiter, '');
    process.env.PATH = process.env.PATH.replace(path.delimiter + oldValue, '');
  }
  if (newValue && process.env.PATH.indexOf(newValue) < 0) {
    process.env.PATH = newValue + path.delimiter + process.env.PATH;
  }
}

export function highlightActiveProject(isEnabled=true, retries=3) {
  const p = getActiveProjectPath();
  const dirs = [].slice.call(document.querySelectorAll('ol.tree-view > li'));

  dirs.forEach((dir) => dir.classList.remove('pio-active-directory'));
  if (dirs.length < 2 || !isEnabled || !p || p === config.NO_ELIGIBLE_PROJECTS_FOUND) {
    return;
  }

  let done = false;
  for (const dir of dirs) {
    if (dir.querySelector(`.project-root > .header > span[data-path="${p.toString()}"]`)) {
      dir.classList.add('pio-active-directory');
      done = true;
      break;
    }
  }
  // When running from `atom.project.onDidChangePaths()` or when Atom just starts,
  // an active project directory may not exist in tree-view yet. We should wait
  // for a while and repeat a search, or else user won't be able to recognize
  // a currently active project.
  if (!done && retries > 0) {
    setTimeout(() => highlightActiveProject(isEnabled, retries - 1), 100);
  }
}

const _allLibWatchers = new Map();
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
  const removedPaths = Array.from(_allLibWatchers.keys()).filter(p => currentPaths.indexOf(p) === -1);
  clearLibChangeWatchers(removedPaths);

  // Update watches on open paths
  projectPaths.map(p => {
    if (!isPioProject(p)) {
      return;
    }

    if (!_allLibWatchers.has(p)) {
      _allLibWatchers.set(p, {
        local: {path: null, disposable: null},
        global: {path: null, disposable: null},
        config: {disposable: null},
      });
    }
    const projectLibDisposables = _allLibWatchers.get(p);

    const localLibDirPath = path.join(p, 'lib');

    let globalLibDir;
    const warningMessage = 'Failed to get a global libraries directory.';
    try {
      const args = ['-c', 'from platformio import util; print util.get_lib_dir()'];
      const child = child_process.spawnSync(getPythonExecutable(), args, {cwd: p});
      if (child.status === 0) {
        globalLibDir = child.stdout.toString().trim();
      } else {
        console.warn(warningMessage);
      }
    } catch(e) {
      console.warn(warningMessage);
    }

    if (!projectLibDisposables.local.disposable) {
      setupLibDirWatch(projectLibDisposables.local, new Directory(localLibDirPath), p);
    }

    if (projectLibDisposables.global.path !== globalLibDir) {
      if (projectLibDisposables.global.disposable && typeof projectLibDisposables.global.disposable === 'function') {
        projectLibDisposables.global.disposable.dispose();
      }
      projectLibDisposables.global.disposable = null;
    }

    if (!projectLibDisposables.global.disposable) {
      setupLibDirWatch(projectLibDisposables.global, new Directory(globalLibDir), p);
    }

    if (!projectLibDisposables.config.disposable) {
      const platfirmioIni = new File(path.join(p, 'platformio.ini'));
      projectLibDisposables.config.disposable = platfirmioIni.onDidChange(() => {
        handleLibChanges([p]);
        intendToPerformIndexRebuild(p);
      });
    }
  });
}

function setupLibDirWatch(libObj, dir, projectPath) {
  if (!dir.existsSync()) {
    return;
  }

  libObj.path = dir.getPath();

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

const _intensionsCache = new Map();
export function intendToPerformIndexRebuild(p, firstRun=true, recursionDepth=0) {
  if (!_intensionsCache.has(p)) {
    _intensionsCache.set(p, []);
  }
  const intensions = _intensionsCache.get(p);
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
    rebuildIndex(p);
    return;
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

export function clearLibChangeWatchers(paths) {
  paths = typeof paths === 'undefined' ? atom.project.getPaths() : paths;
  for (const p of paths) {
    if (_allLibWatchers.has(p)) {
      const libWatch = _allLibWatchers.get(p);
      if (libWatch) {
        for (const kind of ['global', 'local', 'config']) {
          libWatch[kind].path = null;
          if (libWatch[kind].disposable && typeof libWatch[kind].disposable.dispose === 'function') {
            libWatch[kind].disposable.dispose();
          }
          libWatch[kind].disposable = null;
        }
      }
      _allLibWatchers.delete(p);
    }
  }
}
