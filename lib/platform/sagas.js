/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition */

import * as actions from './actions';
import * as selectors from './selectors';

import { call, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { deleteEntity, updateEntity } from '../core/actions';
import { fetchBoards, fetchRegistryPackages, runPlatformCommand } from './helpers';


// Cache size
const INSTALLED_PLATFORMS_DATA_CACHE = 10;

export function* _loadRegistryPlatforms(silent) {
  let items = [];
  try {
    items = yield call(runPlatformCommand, 'search', {
      extraArgs: ['--json-output'],
      silent
    });
  } catch (err) {
    console.error(err);
  }
  yield put(updateEntity('registryPlatforms', items));
}

export function* _loadRegistryFrameworks(silent) {
  let items = [];
  try {
    items = yield call(runPlatformCommand, 'frameworks', {
      extraArgs: ['--json-output'],
      silent
    });
  } catch (err) {
    console.error(err);
  }
  yield put(updateEntity('registryFrameworks', items));
}

export function* checkRegistryPlatformsAndFrameworks(silent) {
  const tasks = [];
  if (!(yield select(selectors.getRegistryPlatforms))) {
    tasks.push(call(_loadRegistryPlatforms, silent));
  }
  if (!(yield select(selectors.getRegistryFrameworks))) {
    tasks.push(call(_loadRegistryFrameworks, silent));
  }
  yield tasks;
}

function* checkBoards() {
  if (yield select(selectors.getBoards)) {
    return;
  }
  try {
    yield put(updateEntity('boards', yield call(fetchBoards)));
  } catch (err) {
    console.error(err);
  }
}

function* checkRegistryPackages() {
  if (yield select(selectors.getRegistryPackages)) {
    return;
  }
  let items = [];
  try {
    items = yield call(fetchRegistryPackages);
  } catch (err) {
    console.error(err);
  }
  yield put(updateEntity('registryPackages', items));
}

// WATCHERS

function* watchLoadBoards() {
  const silent = true;
  while (true) {
    yield take(actions.LOAD_BOARDS);
    yield call(checkRegistryPlatformsAndFrameworks, silent);
    yield call(checkBoards);
  }
}

function* watchLoadRegistryPlatformsOrFrameworks() {
  yield takeEvery('*', function* (action) {
    if ([actions.LOAD_REGISTRY_PLATFORMS, actions.LOAD_REGISTRY_FRAMEWORKS].includes(action.type)) {
      yield call(checkRegistryPlatformsAndFrameworks);
    }
  });
}

function* watchLoadPlatformData() {
  yield takeLatest(actions.LOAD_PLATFORM_DATA, function*({name}) {
    // need this data to make titled buttons
    const silent = name.includes('@');
    yield call(checkRegistryPlatformsAndFrameworks, silent);

    // if installed platform with specific version
    if (name.includes('@')) {
      if (yield select(selectors.getInstalledPlatformData, name)) {
        return;
      }
      try {
        const data = yield call(runPlatformCommand, 'show', {
          extraArgs: [name, '--json-output']
        });
        const items = (yield select(selectors.getInstalledPlatformsData)) || [];
        items.push(data);
        yield put(updateEntity('installedPlatformsData', items.slice(INSTALLED_PLATFORMS_DATA_CACHE * -1)));
      } catch (err) {
        console.error(err);
      }
    }
    else {
      yield [call(checkBoards), call(checkRegistryPackages)];
    }
  });
}

function* watchLoadFrameworkData() {
  yield takeLatest(actions.LOAD_FRAMEWORK_DATA, function*() {
    const silent = false;
    yield [call(checkRegistryPlatformsAndFrameworks, silent), call(checkBoards)];
  });
}

function* watchLoadInstalledPlatforms() {
  while (true) {
    yield take(actions.LOAD_INSTALLED_PLATFORMS);
    const items = yield select(selectors.getInstalledPlatforms);
    if (items) {
      continue;
    }
    yield call(function*() {
      try {
        const items = yield call(runPlatformCommand, 'list', {
          extraArgs: ['--json-output']
        });
        yield put(updateEntity('installedPlatforms', items));
      } catch (err) {
        console.error(err);
      }
    });
  }
}

function* watchLoadPlatformUpdates() {
  while (true) {
    yield take(actions.LOAD_PLATFORM_UPDATES);
    yield put(deleteEntity(/^platformUpdates/)); // clean cache
    yield call(function*() {
      try {
        const items = yield call(runPlatformCommand, 'update', {
          extraArgs: ['--only-check', '--json-output']
        });
        yield put(updateEntity('platformUpdates', items));
      } catch (err) {
        console.error(err);
      }
    });
  }
}

function* watchInstallPlatform() {
  yield takeEvery(actions.INSTALL_PLATFORM, function*({platform, onEnd}) {
    // clean cache
    yield put(deleteEntity(/^installedPlatforms/));
    try {
      const result = yield runPlatformCommand('install', {
        extraArgs: [platform]
      });
      atom.notifications.addSuccess(
        'Platform has been successfully installed', {
          detail: result,
          dismissable: true
        }
      );
    } catch (err) {
      if (err) {
        console.error(err);
      }
    }
    finally {
      if (onEnd) {
        yield call(onEnd);
      }
    }
  });
}

function* watchUninstallOrUpdatePlatform() {
  yield takeEvery('*', function*(action) {
    if (![actions.UNINSTALL_PLATFORM, actions.UPDATE_PLATFORM].includes(action.type)) {
      return;
    }
    const {pkgDir, onEnd} = action;
    try {
      const result = yield runPlatformCommand(
        action.type === actions.UNINSTALL_PLATFORM ? 'uninstall' : 'update',
        {
          extraArgs: [pkgDir]
        }
      );

      // remove from state
      if (action.type === actions.UPDATE_PLATFORM) {
        yield put(deleteEntity(/^installedPlatforms/));
      }
      const state = yield select();
      for (const key of Object.keys(state.entities)) {
        if (!['installedPlatformsData', 'installedPlatforms', 'platformUpdates'].includes(key)) {
          continue;
        }
        if (state.entities[key].find(item => item.__pkg_dir === pkgDir)) {
          yield put(updateEntity(key, state.entities[key].filter(item => item.__pkg_dir !== pkgDir)));
        }
      }

      atom.notifications.addSuccess(
        `Platform has been successfully ${action.type === actions.UNINSTALL_PLATFORM? 'uninstalled' : 'updated'}`, {
          detail: result,
          dismissable: true
        }
      );
    } catch (err) {
      if (err) {
        console.error(err);
      }
    }
    finally {
      if (onEnd) {
        yield call(onEnd);
      }
    }
  });
}

export default [
  watchLoadBoards,
  watchLoadRegistryPlatformsOrFrameworks,
  watchLoadPlatformData,
  watchLoadFrameworkData,
  watchLoadInstalledPlatforms,
  watchLoadPlatformUpdates,
  watchInstallPlatform,
  watchUninstallOrUpdatePlatform
];
