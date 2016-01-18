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
