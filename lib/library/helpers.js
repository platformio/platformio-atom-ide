/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';

import fs from 'fs-plus';
import { isPioProject } from '../project/helpers';


export function runLibraryCommand(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    let args = ['lib'];
    const spawnOptions = {};

    if (options.storage && isPioProject(options.storage)) {
      spawnOptions['cwd'] = options.storage;
    } else if (options.storage) {
      args.push('--storage-dir');
      args.push(options.storage);
    } else {
      args.push('--global');
    }
    args.push(cmd);
    if (options.extraArgs) {
      args = args.concat(options.extraArgs);
    }

    utils.runPIOCommand(
      args,
      (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          utils.notifyError(
            `Library command failed: ${args.join(' ')}`, error);
          return reject(error);
        }
        resolve(args.includes('--json-output') ? JSON.parse(stdout) : stdout);
      },
      {
        spawnOptions
      }
    );
  });
}

export function getCustomStorages() {
  const items = [];
  const storagesStr = atom.config.get(
    'platformio-ide.advanced.customLibraryStorages').trim();
  if (storagesStr) {
    storagesStr.split(', ').map(p => items.push(p.trim()));
  }
  return items.filter(p => fs.isDirectorySync(p));
}

export function saveCustomStorage(storagePath) {
  const current = getCustomStorages();
  storagePath = storagePath.trim();
  if (!fs.isDirectorySync(storagePath) || current.includes(storagePath)) {
    return false;
  }
  current.push(storagePath);
  atom.config.set(
    'platformio-ide.advanced.customLibraryStorages',
    current.filter(p => fs.isDirectorySync(p)).join(', ')
  );
  return true;
}
