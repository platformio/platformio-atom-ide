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
import {PYTHON_BINARY} from './constants';

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function getPythonExecutable(forceBase) {
  if (!forceBase && getUseBuiltinPlatformio()) {
    return PYTHON_BINARY;
  } else {
    return atom.config.get('platformio-atom.basePython');
  }
}

export function getUseBuiltinPlatformio() {
  return atom.config.get('platformio-atom.useBuiltinPlatformio');
}

// Recursively find directory with given name
export function findDirByName(dirName, where) {
  var queue = [where];
  var subdirs, item, fullPathToDir, stat;
  while (queue) {
    item = queue.splice(0, 1)[0];  // take the first element from the queue
    subdirs = fs.readdirSync(item);
    for (var i = 0; i < subdirs.length; i++) {
      fullPathToDir = path.join(item, subdirs[i]);
      stat = fs.statSyncNoException(fullPathToDir);
      if (stat && !stat.isDirectory()) {
        continue;
      }

      if (subdirs[i] === dirName) {
        return fullPathToDir;
      } else {
        queue.push(fullPathToDir);
      }
    }
  }
  return -1;
}
