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
import {ENV_BIN_DIR, WIN32} from './constants';

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let _pythonExecutableCached = null;
// Get the system executable
export function getPythonExecutable() {
  if (!_pythonExecutableCached) {
    let executables;
    if (WIN32) {
      executables = ['python.exe', 'C:\\Python27\\python.exe'];
    } else {
      executables = ['python2.7', 'python'];
    }

    const args = ['-c', 'import sys; print \'.\'.join(str(v) for v in sys.version_info[:2])'];
    for (let i = 0; i < executables.length; i++) {
      const result = child_process.spawnSync(executables[i], args);
      if (0 === result.status && ('' + result.output).indexOf('2.7') > -1) {
        _pythonExecutableCached = executables[i];
      }
    }

    if (!_pythonExecutableCached) {
      // Fallback to `python`. User will see an error message if Python is not
      // installed.
      // Not caching, so restart will not be necessary in case user installs
      // Python right after an error message is seen.
      return 'python';
    }
  }
  return _pythonExecutableCached;
}

export function getPlatformIOExecutable() {
  if (useBuiltinPlatformIO()) {
    return path.join(ENV_BIN_DIR, 'platformio');
  }
  return 'platformio';
}

export function useBuiltinPlatformIO() {
  return atom.config.get('platformio-atom.useBuiltinPlatformio');
}

// Recursively find directory with given name
export function findFileByName(desiredFileName, where) {
  var queue = [where];
  var content, item, fullPath, stat;
  while (queue) {
    item = queue.splice(0, 1)[0];  // take the first element from the queue
    content = fs.readdirSync(item);
    for (var i = 0; i < content.length; i++) {
      fullPath = path.join(item, content[i]);
      stat = fs.statSyncNoException(fullPath);
      if (!stat) {
        continue;
      }

      if (stat.isFile() && content[i] === desiredFileName) {
        return fullPath;
      } else if (stat.isDirectory()) {
        queue.push(fullPath);
      }
    }
  }
  return -1;
}

export function runAtomCommand(commandName) {
  return atom.commands.dispatch(
    atom.views.getView(atom.workspace), commandName);
}

export function removeChildrenOf(node) {
  if (!node) return;
  while(node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
