/** @babel */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as utils from '../utils';

import fs from 'fs-plus';
import { isPioProject } from '../project/util';
import path from 'path';


export class LibStorageItem {

  static ACTION_REVEAL = 1;
  static ACTION_UNINSTALL = 2;
  static ACTION_UPDATE = 4;
  static ACTION_ALL = 8;

  constructor(name, path = undefined, items = undefined) {
    this.name = name;
    this.path = path;
    this._items = items;
    this._actions = LibStorageItem.ACTION_REVEAL;
  }

  get items() {
    return this._items;
  }

  set items(items) {
    if (items && items.length && !this.path) {
      this.path = path.dirname(items[0].__pkg_dir);
    }
    this._items = items;
  }

  get actions() {
    return this._actions;
  }

  set actions(actions) {
    if (typeof actions === 'number' && actions <= LibStorageItem.ACTION_ALL) {
      this._actions = actions;
    }
  }

}

export function runLibraryCommand(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    let args = ['lib'];
    const spawnOptions = {};

    let cacheValid = null;
    switch (cmd) {
      case 'show':
        cacheValid = '1d';
        break;

      case 'search':
        cacheValid = '3d';
        break;
    }

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
        cacheValid,
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
