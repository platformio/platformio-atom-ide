/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as pioNodeHelpers from 'platformio-node-helpers';
import * as utils from './utils';

import fs from 'fs-plus';


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

export function notifyDebuggerIsDeprecated() {
  if (localStorage.getItem('platformio-ide:debugger-deprecated') === '1') {
    return;
  }

  atom.confirm({
    message: 'PlatformIO: Debugger for Atom is deprecated',
    detailedMessage: 'Please use PIO Unified Debugger for VSCode with advanced instruments ' +
      '(peripheral and registry views, disassembly, memory view, multithreading & RTOS, etc.)',
    buttons: {
      'Try VSCode': () => {
        utils.openUrl('http://docs.platformio.org/page/ide/vscode.html');
      },
      'Remind Later': () => {},
      'Do not show this message': () => localStorage.setItem('platformio-ide:debugger-deprecated', '1')
    }
  });
}

export function highlightActiveProject(isEnabled = true, retries = 3) {
  const p = utils.getActivePioProject();
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
