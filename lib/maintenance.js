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
import child_process from 'child_process';
import {command as installPlatformIO} from './install/command';
import {getPythonExecutable, runAtomCommand, useBuiltinPlatformIO} from './utils';
import {ENV_BIN_DIR, WIN32, BASE_DIR} from './constants';

export function onActivate() {
  installPlatformIO();
  updateOSEnviron();
  checkClang();
}

export function updateOSEnviron() {
  if (useBuiltinPlatformIO()) {  // Insert bin directory into PATH
    if (process.env.PATH.indexOf(ENV_BIN_DIR) < 0) {
      process.env.PATH = ENV_BIN_DIR + path.delimiter + process.env.PATH;
    }
  } else {  // Remove bin directory from PATH
    process.env.PATH = process.env.PATH.replace(ENV_BIN_DIR + path.delimiter, "");
    process.env.PATH = process.env.PATH.replace(path.delimiter + ENV_BIN_DIR, "");
  }

  process.env.PLATFORMIO_CALLER = "atom";
  process.env.PLATFORMIO_SETTING_ENABLE_PROMPTS = "false";
  process.env.PLATFORMIO_DISABLE_PROGRESSBAR = "true";
}

export function installCommands() {
  if (WIN32) {
    const winCheckResult = child_process.spawnSync('platformio', ['--version']);
    if (0 !== winCheckResult.status) {
      const addResult = child_process.spawnSync(
        getPythonExecutable(),
        [path.join(BASE_DIR, 'misc', 'add_path_to_envpath.py'), ENV_BIN_DIR]);
      if (0 !== addResult.status) {
        atom.notifications.addError('Failed to install PlatformIO commands!', {
          detail: addResult.stderr,
        });
        console.error('' + addResult.stderr);
      } else {
        atom.notifications.addSuccess('PlatformIO commands have been successfully installed');
      }
    }
  } else {
    const checkResult = child_process.spawnSync('/bin/sh', ['-c', 'command -v platformio --version']);
    if (0 !== checkResult.status) {
      fs.symlinkSync(path.join(ENV_BIN_DIR, 'platformio'), '/usr/local/bin/platformio');
      fs.symlinkSync(path.join(ENV_BIN_DIR, 'pio'), '/usr/local/bin/pio');
    }
  }
}

export function openTerminal(cmd) {
  const status = runAtomCommand('ult-terminal:new');
  if (status === false) {
    atom.notifications.addWarning('Unable to open a terminal.');
    return;
  }

  let inputElement = document.querySelector('.ult-terminal .editor');
  inputElement.getModel().setText(cmd);

  let panel = document.querySelector(".panel.ult-terminal");
  atom.commands.dispatch(atom.views.getView(panel), 'core:confirm');
}

export function checkClang() {
  if (localStorage.getItem('platformio-ide:clang-checked')) {
    return;
  }
  const result = child_process.spawnSync('clang', ['--version']);
  if (result.status !== 0) {
    atom.notifications.addWarning('Clang is not installed in your system!', {
      detail: 'PlatformIO IDE uses "clang" for the code autocompletion and linting.\n' +
      'Please install it otherwise these features will be disabled.\n' +
      'Details: http://docs.platformio.org/en/latest/ide/atom.html#code-completion-and-linting',
      dismissable: 'true'
    });
  }
  localStorage.setItem('platformio-ide:clang-checked', 1);
}
