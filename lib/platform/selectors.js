/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';

import fuzzaldrin from 'fuzzaldrin-plus';
import { getInputValue } from '../core/selectors';


// Data Filters
export const BOARDS_INPUT_FILTER_KEY = 'boardsFilter';
export const FRAMEWORKS_INPUT_FILTER_KEY = 'frameworksFilter';
export const EMBEDDED_INPUT_FILTER_KEY = 'platformEmebddedFilter';
export const DESKTOP_INPUT_FILTER_KEY = 'platformDesktopFilter';
export const INSTALLED_INPUT_FILTER_KEY = 'platformInstalledFilter';
export const UPDATES_INPUT_FILTER_KEY = 'platformUpdatesFilter';

export function getBoardsFilter(state) {
  return getInputValue(state, BOARDS_INPUT_FILTER_KEY);
}

export function getFrameworksFilter(state) {
  return getInputValue(state, FRAMEWORKS_INPUT_FILTER_KEY);
}

export function getEmbeddedFilter(state) {
  return getInputValue(state, EMBEDDED_INPUT_FILTER_KEY);
}

export function getDesktopFilter(state) {
  return getInputValue(state, DESKTOP_INPUT_FILTER_KEY);
}

export function getInstalledFilter(state) {
  return getInputValue(state, INSTALLED_INPUT_FILTER_KEY);
}

export function getUpdatesFilter(state) {
  return getInputValue(state, UPDATES_INPUT_FILTER_KEY);
}

// Entities

export function getBoards(state) {
  return state.entities.boards || null;
}

export function getRegistryPackages(state) {
  return state.entities.registryPackages || null;
}

export function getRegistryPlatforms(state) {
  return state.entities.registryPlatforms || null;
}

export function getRegistryFrameworks(state) {
  return state.entities.registryFrameworks || null;
}

export function getInstalledPlatforms(state) {
  return state.entities.installedPlatforms || null;
}

export function getPlatformUpdates(state) {
  return state.entities.platformUpdates || null;
}

export function getInstalledPlatformsData(state) {
  return state.entities.installedPlatformsData || null;
}

export function getInstalledPlatformData(state, nameAndVersion) {
  const items = getInstalledPlatformsData(state);
  if (!items) {
    return null;
  }
  return items.find(item => `${item.name}@${item.version}` === nameAndVersion);
}

// Expanders

export function expandFrameworksOrPlatforms(state, what, items) {
  if (!items.length || typeof items[0] !== 'string') {
    return items;
  }
  const data = (what === 'platforms' ? getRegistryPlatforms(state) : getRegistryFrameworks(state)) || [];
  if (items.length && items[0] === '*') {
    return data.map(item => {
      return {
        name: item.name,
        title: item.title
      };
    });
  }
  return items.map(name => {
    let title = utils.title(name);
    for (const d of data) {
      if (d.name === name) {
        title = d.title;
      }
    }
    return {
      name,
      title
    };
  });
}

export function expandRegistryPackages(state, items) {
  if (!items.length || typeof items[0] !== 'string') {
    return items;
  }
  const packages = getRegistryPackages(state);
  return items.map(name => {
    if (!packages) {
      return {
        name
      };
    }
    return {
      name: name,
      url: packages[name].url,
      description: packages[name].description
    };
  });
}

// Filtered selectors

export function getVisibleBoards(state) {
  const boards = getBoards(state);
  if (!boards) {
    return null;
  }
  return boards.map(item => {
    const newItem = Object.assign({}, item);
    newItem.platform = expandFrameworksOrPlatforms(state, 'platforms', [newItem.platform])[0];
    newItem.frameworks = expandFrameworksOrPlatforms(state, 'frameworks', newItem.frameworks);
    return newItem;
  });
}

export function getVisibleEmbeddedPlatforms(state) {
  const filterValue = getEmbeddedFilter(state);
  let items = getRegistryPlatforms(state);
  if (!items) {
    return null;
  }
  items = items.filter(item => !item.forDesktop);
  items = items.map(item => {
    const newItem = Object.assign({}, item);
    newItem.frameworks = expandFrameworksOrPlatforms(state, 'frameworks', newItem.frameworks);
    return newItem;
  });
  if (!filterValue) {
    return items;
  }
  return fuzzaldrin.filter(items, filterValue, { key: 'name' });
}

export function getVisibleDesktopPlatforms(state) {
  const filterValue = getDesktopFilter(state);
  let items = getRegistryPlatforms(state);
  if (!items) {
    return null;
  }
  items = items.filter(item => item.forDesktop);
  items = items.map(item => {
    const newItem = Object.assign({}, item);
    newItem.frameworks = expandFrameworksOrPlatforms(state, 'frameworks', newItem.frameworks);
    return newItem;
  });
  if (!filterValue) {
    return items;
  }
  return fuzzaldrin.filter(items, filterValue, { key: 'name' });
}

export function getPlatformData(state, name) {
  let data = null;
  if (name.includes('@')) {
    data = getInstalledPlatformData(state, name);
  }
  else {
    data = getRegistryPlatforms(state).find(item => item.name === name);
  }
  if (!data) {
    return null;
  }

  data = Object.assign({}, data);

  if (data.frameworks && data.frameworks.length) {
    data.frameworks = expandFrameworksOrPlatforms(state, 'frameworks', data.frameworks);
  }
  if (data.packages && data.packages.length) {
    data.packages = expandRegistryPackages(state, data.packages);
  }
  // if platform from a registry
  if (!data.boards) {
    const boards = getBoards(state);
    if (boards) {
      data.boards = boards.filter(
        item => item.platform === data.name
      ).map(item => Object.assign({}, item));
    }
  }

  // make titled frameworks and platforms
  if (data.boards) {
    data.boards = data.boards.map(item => {
      item.platform = expandFrameworksOrPlatforms(state, 'platforms', [item.platform])[0];
      item.frameworks = expandFrameworksOrPlatforms(state, 'frameworks', item.frameworks);
      return item;
    });
  }

  return data;
}

export function getFrameworkData(state, name) {
  let data = getRegistryFrameworks(state).find(item => item.name === name);
  if (!data) {
    return null;
  }
  data = Object.assign({}, data);

  if (data.platforms && data.platforms.length) {
    data.platforms = expandFrameworksOrPlatforms(state, 'platforms', data.platforms);
  }

  const boards = getBoards(state);
  if (boards) {
    data.boards = boards.filter(
      item => item.frameworks.includes(data.name)
    ).map(item => Object.assign({}, item));
    // make titled frameworks and platforms
    data.boards = data.boards.map(item => {
      item.platform = expandFrameworksOrPlatforms(state, 'platforms', [item.platform])[0];
      item.frameworks = expandFrameworksOrPlatforms(state, 'frameworks', item.frameworks);
      return item;
    });
  }

  return data;
}

export function getVisibleInstalledPlatforms(state) {
  const filterValue = getInstalledFilter(state);
  let items = getInstalledPlatforms(state);
  if (!items) {
    return null;
  }
  items = items.map(item => {
    const newItem = Object.assign({}, item);
    newItem.frameworks = expandFrameworksOrPlatforms(state, 'frameworks', newItem.frameworks);
    return newItem;
  });
  if (!filterValue) {
    return items;
  }
  return fuzzaldrin.filter(items, filterValue, { key: 'name' });
}

export function getVisiblePlatformUpdates(state) {
  const filterValue = getUpdatesFilter(state);
  let items = getPlatformUpdates(state);
  if (!items) {
    return null;
  }
  items = items.map(item => {
    const newItem = Object.assign({}, item);
    newItem.frameworks = expandFrameworksOrPlatforms(state, 'frameworks', newItem.frameworks);
    return newItem;
  });
  if (!filterValue) {
    return items;
  }
  return fuzzaldrin.filter(items, filterValue, { key: 'name' });
}

export function getVisibleFrameworks(state) {
  const filterValue = getFrameworksFilter(state);
  let items = getRegistryFrameworks(state);
  if (!items) {
    return null;
  }
  items = items.map(item => {
    const newItem = Object.assign({}, item);
    newItem.platforms = expandFrameworksOrPlatforms(state, 'platforms', newItem.platforms);
    return newItem;
  });
  if (!filterValue) {
    return items;
  }
  return fuzzaldrin.filter(items, filterValue, { key: 'name' });
}
