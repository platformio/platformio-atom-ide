/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { LibraryStorage, filterStorageItems, getLibraryStorages } from './storage';
import { expandFrameworksOrPlatforms, getRegistryFrameworks, getRegistryPlatforms } from '../platform/selectors';

import { getInputValue } from '../core/selectors';


// Data Filters
export const BUILTIN_INPUT_FILTER_KEY = 'libBuiltinFilter';
export const INSTALLED_INPUT_FILTER_KEY = 'libInstalledFilter';
export const UPDATES_INPUT_FILTER_KEY = 'libUpdatesFilter';

export function getBuiltinFilter(state) {
  return getInputValue(state, BUILTIN_INPUT_FILTER_KEY);
}

export function getInstalledFilter(state) {
  return getInputValue(state, INSTALLED_INPUT_FILTER_KEY);
}

export function getUpdatesFilter(state) {
  return getInputValue(state, UPDATES_INPUT_FILTER_KEY);
}


export function getStoreSearchKey(query, page = 0) {
  return [query, page].join();
}

export function getSearchResults(state) {
  return state.entities.libSearch || null;
}

export function getSearchResult(state, query, page = 1) {
  const items = getSearchResults(state);
  if (!items) {
    return null;
  }
  const item = items.find(item => item.key === getStoreSearchKey(query, page));
  return item ? item.result : null;
}

export function getStats(state) {
  return state.entities.libStats || null;
}

export function getRegistryLibs(state) {
  return state.entities.registryLibs || null;
}

export function getRegistryLib(state, id) {
  const items = getRegistryLibs(state);
  if (!items) {
    return null;
  }
  return items.find(item => item.id === id) || null;
}

export function getLibraryData(state, idOrManifest) {
  if (typeof idOrManifest === 'number') {
    return getRegistryLib(state, parseInt(idOrManifest));
  } else if (!getRegistryPlatforms(state) || !getRegistryFrameworks(state)) {
    return null;
  }

  const data = Object.assign({}, idOrManifest);
  // fix platforms and frameworks
  for (const key of ['platforms', 'frameworks']) {
    if (!data.hasOwnProperty(key) || data[key].length === 0 || (typeof data[key][0] === 'object' && data[key][0].name)) {
      continue;
    }
    data[key] = expandFrameworksOrPlatforms(state, key, data[key]);
  }

  // fix repository url
  if (data.repository && data.repository.url) {
    data.repository = data.repository.url;
  }

  // missed fields
  for (const key of ['authors', 'frameworks', 'platforms', 'keywords']) {
    if (!data.hasOwnProperty(key)) {
      data[key] = [];
    }
  }
  return data;
}

export function getBuiltinLibs(state) {
  return state.entities.builtinLibs || null;
}

export function getVisibletBuiltinLibs(state) {
  const filterValue = getBuiltinFilter(state);
  const items = getBuiltinLibs(state);
  if (!items) {
    return null;
  } else if (!filterValue) {
    return items;
  }
  return filterStorageItems(items, filterValue);
}

export function getInstalledLibs(state) {
  return getLibraryStorages().map(storage => {
    const key = `installedLibs${storage.initialPath}`;
    if (state.entities.hasOwnProperty(key)) {
      storage.items = state.entities[key];
    }
    storage.actions = LibraryStorage.ACTION_REVEAL | LibraryStorage.ACTION_UNINSTALL;
    return storage;
  });
}

export function getVisibleInstalledLibs(state) {
  const filterValue = getInstalledFilter(state);
  const items = getInstalledLibs(state);
  if (!items) {
    return null;
  } else if (!filterValue) {
    return items;
  }
  return filterStorageItems(items, filterValue);
}

export function getLibUpdates(state) {
  return getLibraryStorages().map(storage => {
    const key = `libUpdates${storage.initialPath}`;
    if (state.entities.hasOwnProperty(key)) {
      storage.items = state.entities[key];
    }
    storage.actions = LibraryStorage.ACTION_REVEAL | LibraryStorage.ACTION_UPDATE;
    return storage;
  });
}

export function getVisibleLibUpdates(state) {
  const filterValue = getUpdatesFilter(state);
  const items = getLibUpdates(state);
  if (!items) {
    return null;
  } else if (!filterValue) {
    return items;
  }
  return filterStorageItems(items, filterValue);
}
