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

import * as config from './config';
import * as utils from './utils';

import child_process from 'child_process';
import fs from 'fs';
import { getActivePioProject } from './project/util';
import path from 'path';


export function updateOSEnviron() {
  // Fix for platformio-atom-ide/issues/112
  process.env.LC_ALL = 'en_US.UTF-8';
  process.env.PLATFORMIO_CALLER = 'atom';
  process.env.PLATFORMIO_DISABLE_PROGRESSBAR = 'true';
  process.env.PLATFORMIO_IDE = utils.getIDEVersion();

  // Fix for https://github.com/atom/atom/issues/11302
  if (process.env.Path) {
    if (process.env.PATH) {
      process.env.PATH += path.delimiter + process.env.Path;
    } else {
      process.env.PATH = process.env.Path;
    }
  }

  if (atom.config.get('platformio-ide.useBuiltinPIOCore')) { // Insert bin directory into PATH
    if (!process.env.PATH.includes(config.ENV_BIN_DIR)) {
      process.env.PATH = config.ENV_BIN_DIR + path.delimiter + process.env.PATH;
    }
  } else { // Remove bin directory from PATH
    process.env.PATH = process.env.PATH.replace(config.ENV_BIN_DIR + path.delimiter, '');
    process.env.PATH = process.env.PATH.replace(path.delimiter + config.ENV_BIN_DIR, '');
  }

  handleCustomPATH(atom.config.get('platformio-ide.advanced.customPATH'));

  // copy PATH to Path (Windows issue)
  if (process.env.Path) {
    process.env.Path = process.env.PATH;
  }
}

export function handleCustomPATH(newValue, oldValue) {
  if (oldValue) {
    process.env.PATH = process.env.PATH.replace(oldValue + path.delimiter, '');
    process.env.PATH = process.env.PATH.replace(path.delimiter + oldValue, '');
  }
  if (newValue && !process.env.PATH.includes(newValue)) {
    process.env.PATH = newValue + path.delimiter + process.env.PATH;
  }
}

export function handleShowPlatformIOFiles() {
  const ignoredNames = atom.config.get('core.ignoredNames');
  for (const name of ['.pioenvs', '.piolibdeps', '.clang_complete', '.gcc-flags.json']) {
    if (!ignoredNames.includes(name)) {
      ignoredNames.push(name);
    }
  }
  atom.config.set('core.ignoredNames', ignoredNames);
  atom.config.set('tree-view.hideIgnoredNames', !atom.config.get('platformio-ide.advanced.showPlatformIOFiles'));
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
      'Enable': () => {
        localStorage.setItem('platformio-ide:linter-warned', '2');
        utils.openUrl('http://docs.platformio.org/page/ide/atom.html#smart-code-linter-is-disabled-for-arduino-files');
      },
      'Remind Later': utils.doNothing,
      'Disable': () => localStorage.setItem('platformio-ide:linter-warned', '2')
    }
  });
}

export function installCommands() {
  if (config.IS_WINDOWS) {
    const winCheckResult = child_process.spawnSync('platformio', ['--version']);
    if (0 !== winCheckResult.status) {
      const addResult = child_process.spawnSync(
        'python',
        [path.join(config.PKG_BASE_DIR, 'misc', 'add_path_to_envpath.py'), config.ENV_BIN_DIR]);
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
    const options = {
      env: {}
    };
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
      } catch (e) {
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

export function highlightActiveProject(isEnabled = true, retries = 3) {
  const p = getActivePioProject();
  const dirs = [].slice.call(document.querySelectorAll('ol.tree-view > li'));

  dirs.forEach((dir) => {
    dir.classList.remove('pio-active-directory');
    if (!dir.dataset.pioRealpath) {
      const span = dir.querySelector('.header > span[data-path]');
      try {
        dir.dataset.pioRealpath = fs.realpathSync(span.dataset.path);
      } catch (e) {
        dir.dataset.pioRealpath = span.dataset.path;
      }
    }
  });
  if (dirs.length < 2 || !isEnabled || !p) {
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
