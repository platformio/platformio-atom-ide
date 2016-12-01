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

import * as config from './config';
import {getActiveProjectPath, getIDEVersion, getPythonExecutable, useBuiltinPlatformIO} from './utils';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import {runInTerminal} from './terminal';
import semver from 'semver';
import shell from 'shell';

export function updateOSEnviron() {
  // Fix for https://github.com/atom/atom/issues/11302
  if ('Path' in process.env) {
    if ('PATH' in process.env) {
      process.env.PATH += path.delimiter + process.env.Path;
    }
    else {
      process.env.PATH = process.env.Path;
    }
  }

  // Fix for platformio-atom-ide/issues/112
  process.env.LC_ALL = 'en_US.UTF-8';

  if (useBuiltinPlatformIO()) {  // Insert bin directory into PATH
    if (process.env.PATH.indexOf(config.ENV_BIN_DIR) < 0) {
      process.env.PATH = config.ENV_BIN_DIR + path.delimiter + process.env.PATH;
    }
  } else {  // Remove bin directory from PATH
    process.env.PATH = process.env.PATH.replace(config.ENV_BIN_DIR + path.delimiter, '');
    process.env.PATH = process.env.PATH.replace(path.delimiter + config.ENV_BIN_DIR, '');
  }

  handleCustomPATH(atom.config.get('platformio-ide.customPATH'));

  // export PATH to PlatformIO IDE Terminal
  const terminal_autorun_key = 'platformio-ide-terminal.core.autoRunCommand';
  if (!config.IS_WINDOWS && atom.config.get(terminal_autorun_key) === undefined) {
    if (process.env.SHELL && process.env.SHELL.indexOf('fish') !== -1) {
      atom.config.set(
        terminal_autorun_key,
        'set -gx PATH ' + process.env.PATH.replace(/\:/g, ' ')
      );
    }
    else {
      atom.config.set(terminal_autorun_key, 'export PATH=' + process.env.PATH);
    }
  }

  // copy PATH to Path (Windows issue)
  if ('Path' in process.env) {
    process.env.Path = process.env.PATH;
  }

  process.env.PLATFORMIO_CALLER = 'atom';
  process.env.PLATFORMIO_DISABLE_PROGRESSBAR = 'true';
  process.env.PLATFORMIO_IDE = getIDEVersion();
}

export function setupActivationHooks() {
  if (semver.satisfies(atom.getVersion(), '<1.12.2')) {
    return;
  }

  const package_json_path = path.join(config.BASE_DIR, 'package.json');
  const package_json = require(package_json_path);
  if ('activationHooks' in package_json) {
    return;
  }
  package_json['activationHooks'] = ['core:loaded-shell-environment'];
  fs.writeFile(package_json_path, JSON.stringify(package_json, null, 2), function (err) {
    if (err) {
      return console.error(err);
    }
  });
}

export function handleShowPlatformIOFiles() {
  const ignoredNames = atom.config.get('core.ignoredNames');
  for (const name of ['.pioenvs', '.piolibdeps', '.clang_complete', '.gcc-flags.json']) {
    if (ignoredNames.indexOf(name) === -1) {
      ignoredNames.push(name);
    }
  }
  atom.config.set('core.ignoredNames', ignoredNames);
  atom.config.set('tree-view.hideIgnoredNames', !atom.config.get('platformio-ide.showPlatformIOFiles'));
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
          shell.openExternal('http://docs.platformio.org/page/ide/atom.html#ide-atom-installation-clang');
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
        shell.openExternal('http://docs.platformio.org/page/ide/atom.html#smart-code-linter-is-disabled-for-arduino-files');
      },
      'Remind Later': function() {},
      'Disable': function() {
        localStorage.setItem('platformio-ide:linter-warned', 2);
      }
    }
  });
}

export function installCommands() {
  if (config.IS_WINDOWS) {
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

  dirs.forEach((dir) => {
    dir.classList.remove('pio-active-directory');
    if (!dir.dataset.pioRealpath) {
      const span = dir.querySelector('.header > span[data-path]');
      try {
        dir.dataset.pioRealpath = fs.realpathSync(span.dataset.path);
      }
      catch (e) {
        dir.dataset.pioRealpath = span.dataset.path;
      }
    }
  });
  if (dirs.length < 2 || !isEnabled || !p || p === config.NO_ELIGIBLE_PROJECTS_FOUND) {
    return;
  }

  let done = false;
  for (const dir of dirs) {
    if (dir.dataset.pioRealpath === p.toString()) {
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
