/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fuzzaldrin from 'fuzzaldrin-plus';
import { getCustomStorages } from './helpers';
import { getPioProjects } from '../project/helpers';
import path from 'path';


export class LibraryStorage {

  static ACTION_REVEAL = 1;
  static ACTION_UNINSTALL = 2;
  static ACTION_UPDATE = 4;
  static ACTION_ALL = 8;

  constructor(name, path = undefined, items = undefined, actions = LibraryStorage.ACTION_REVEAL) {
    this.name = name;
    this.path = path;
    this.initialPath = path;
    this._items = items;
    this._actions = actions;
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
    if (typeof actions === 'number' && actions <= LibraryStorage.ACTION_ALL) {
      this._actions = actions;
    }
  }

}

export function getLibraryStorages() {
  let items = getPioProjects().map(
    p => new LibraryStorage(`Project: ${path.basename(p)}`, p)
  );
  items = items.concat(getCustomStorages().map(
    p => new LibraryStorage(`Storage: ${path.basename(p)}`, p)
  ));
  items.push(new LibraryStorage('Global Storage'));
  return items;
}

export function filterStorageItems(storages, filterValue) {
  return storages.map(storage => {
    let items = storage.items;
    if (items && filterValue) {
      items = fuzzaldrin.filter(items, filterValue, {
        key: 'name'
      });
    }
    return new LibraryStorage(storage.name, storage.path, items, storage.actions);
  });
}
