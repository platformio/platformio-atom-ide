/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition */

import * as actions from './actions';
import * as selectors from './selectors';

import { call, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { deleteEntity, updateEntity } from '../core/actions';

import LibraryInstallStoragePrompt from './containers/install-storage-prompt';
import { checkRegistryPlatformsAndFrameworks } from '../platform/sagas';
import { runLibraryCommand } from './helpers';


// Cache size
const SEARCH_RESULTS_CACHE_SIZE = 10;
const REGISTRY_LIBS_CACHE_SIZE = 10;

function* watchLoadStats() {
  while (true) {
    const {force} = yield take(actions.LOAD_STATS);
    let data = yield select(selectors.getStats);
    if (data && !force) {
      continue;
    }
    try {
      data = yield call(runLibraryCommand, 'stats', {
        extraArgs: ['--json-output']
      });
      yield put(updateEntity('libStats', data));
    } catch (err) {
      console.error(err);
    }
  }
}

function* watchLoadSearchResult() {
  yield takeLatest(actions.LOAD_SEARCH_RESULT, function*({query, page}) {
    let result = yield select(selectors.getSearchResult, query, page);
    if (result) {
      return;
    }
    try {
      result = yield call(runLibraryCommand, 'search', {
        extraArgs: [query, '--page', page, '--json-output']
      });
    } catch (err) {
      console.error(err);
      return;
    }
    const results = (yield select(selectors.getSearchResults)) || [];
    results.push({
      key: selectors.getStoreSearchKey(query, page),
      result
    });
    yield put(updateEntity('libSearch', results.slice(SEARCH_RESULTS_CACHE_SIZE * -1)));
  });
}

function* watchLoadLibraryData() {
  yield takeLatest(actions.LOAD_LIBRARY_DATA, function*({idOrManifest}) {
    switch (typeof idOrManifest) {
      case 'number': {
        if (yield select(selectors.getRegistryLib, parseInt(idOrManifest))) {
          return;
        }
        try {
          const data = yield call(runLibraryCommand, 'show', {
            extraArgs: [idOrManifest, '--json-output']
          });
          const items = (yield select(selectors.getRegistryLibs)) || [];
          items.push(data);
          yield put(updateEntity('registryLibs', items.slice(REGISTRY_LIBS_CACHE_SIZE * -1)));
        } catch (err) {
          console.error(err);
        }
        break;
      }

      case 'object': {
        const silent = true;
        yield call(checkRegistryPlatformsAndFrameworks, silent);
        break;
      }
    }
  });
}

function* watchLoadBuiltinLibs() {
  while (true) {
    yield take(actions.LOAD_BUILTIN_LIBS);
    let items = yield select(selectors.getBuiltinLibs);
    if (items) {
      continue;
    }
    try {
      items = yield call(runLibraryCommand, 'builtin', {
        extraArgs: ['--json-output']
      });
      yield put(updateEntity('builtinLibs', items));
    } catch (err) {
      console.error(err);
    }
  }
}

function* watchLoadInstalledLibs() {
  while (true) {
    yield take(actions.LOAD_INSTALLED_LIBS);
    const storages = yield select(selectors.getInstalledLibs);
    for (const storage of storages) {
      if (storage.items) {
        continue;
      }
      yield fork(function*() {
        try {
          const items = yield call(runLibraryCommand, 'list', {
            storage: storage.path,
            extraArgs: ['--json-output']
          });
          yield put(updateEntity(`installedLibs${storage.initialPath}`, items));
        } catch (err) {
          console.error(err);
        }
      });
    }
  }
}

function* watchLoadLibUpdates() {
  while (true) {
    yield take(actions.LOAD_LIB_UPDATES);
    yield put(deleteEntity(/^libUpdates/)); // clean cache
    const storages = yield select(selectors.getLibUpdates);
    for (const storage of storages) {
      yield fork(function*() {
        try {
          const items = yield call(runLibraryCommand, 'update', {
            storage: storage.path,
            extraArgs: ['--only-check', '--json-output']
          });
          yield put(updateEntity(`libUpdates${storage.initialPath}`, items));
        } catch (err) {
          console.error(err);
        }
      });
    }
  }
}

function* watchInstallLibrary() {
  yield takeEvery(actions.INSTALL_LIBRARY, function*({lib, onEnd}) {
    // clean cache
    yield put(deleteEntity(/^installedLibs/));
    try {
      const result = yield runLibraryCommand('install', {
        storage: yield (new LibraryInstallStoragePrompt().prompt()),
        extraArgs: [lib]
      });
      atom.notifications.addSuccess(
        'Library has been successfully installed', {
          detail: result
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

function* watchUninstallOrUpdateLibrary() {
  yield takeEvery('*', function*(action) {
    if (![actions.UNINSTALL_LIBRARY, actions.UPDATE_LIBRARY].includes(action.type)) {
      return;
    }
    const {storageDir, pkgDir, onEnd} = action;
    try {
      const result = yield runLibraryCommand(
        action.type === actions.UNINSTALL_LIBRARY ? 'uninstall' : 'update',
        {
          storage: storageDir,
          extraArgs: [pkgDir]
        }
      );

      // remove from state
      if (action.type === actions.UPDATE_LIBRARY) {
        yield put(deleteEntity(/^installedLibs/));
      }
      const state = yield select();
      for (const key of Object.keys(state.entities)) {
        if (!key.startsWith('installedLibs') && !key.startsWith('libUpdates')) {
          continue;
        }
        if (state.entities[key].find(item => item.__pkg_dir === pkgDir)) {
          yield put(updateEntity(key, state.entities[key].filter(item => item.__pkg_dir !== pkgDir)));
        }
      }

      atom.notifications.addSuccess(
        `Library has been successfully ${action.type === actions.UNINSTALL_LIBRARY? 'uninstalled' : 'updated'}`, {
          detail: result
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
  watchLoadStats,
  watchLoadSearchResult,
  watchLoadLibraryData,
  watchLoadBuiltinLibs,
  watchLoadInstalledLibs,
  watchLoadLibUpdates,
  watchInstallLibrary,
  watchUninstallOrUpdateLibrary
];
