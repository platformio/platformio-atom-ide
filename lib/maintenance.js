/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from './config';
import * as pioNodeHelpers from 'platformio-node-helpers';
import * as utils from './utils';

import child_process from 'child_process';
import fs from 'fs-plus';
import { getActivePioProject } from './project/helpers';
import path from 'path';


export function reinstallPIOCore() {
  const envDir = pioNodeHelpers.core.getEnvDir();
  if (fs.isDirectorySync(envDir)) {
    try {
      fs.removeSync(envDir);
    } catch (err) {
      console.warn(err);
    }
  }
  atom.notifications.addWarning(
    'PlatformIO Core has been uninstalled!',
    {
      detail: 'Please restart Atom to install appropriate version',
      buttons: [
        {
          text: 'Restart',
          onDidClick: () => atom.restartApplication()
        }
      ],
      dismissable: true
    }
  );
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
      'Remind Later': () => {},
      'Disable': () => localStorage.setItem('platformio-ide:linter-warned', '2')
    }
  });
}

export function installCommands() {
  const binDir = pioNodeHelpers.core.getEnvBinDir();
  if (config.IS_WINDOWS) {
    const winCheckResult = child_process.spawnSync('platformio', ['--version']);
    if (0 !== winCheckResult.status) {
      const addResult = child_process.spawnSync(
        'python',
        [path.join(config.PKG_BASE_DIR, 'misc', 'add_path_to_envpath.py'), binDir]);
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
        [path.join(binDir, 'platformio'), '/usr/local/bin/platformio'],
        [path.join(binDir, 'pio'), '/usr/local/bin/pio'],
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
  const dirs = [].slice.call(document.querySelectorAll('ol.tree-view-root > li'));
  dirs.forEach((dir) => {
    dir.classList.remove('pio-active-directory');
    if (!dir.dataset.pioProjectPath) {
      const span = dir.querySelector('.project-root-header > span[data-path]');
      dir.dataset.pioProjectPath = fs.realpathSync(span.dataset.path);
    }
  });
  if (dirs.length < 2 || !isEnabled || !p) {
    return;
  }

  let done = false;
  for (const dir of dirs) {
    if (dir.dataset.pioProjectPath === p) {
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
