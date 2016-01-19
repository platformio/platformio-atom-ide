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
import {getPythonExecutable} from './utils';
import {ENV_BIN_DIR, WIN32, BASE_DIR} from './constants';

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
