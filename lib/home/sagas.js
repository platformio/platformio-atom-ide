/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition */

import * as actions from './actions';

import { call, fork, put, takeEvery, takeLatest } from 'redux-saga/effects';

import Telemetry from '../telemetry';
import { asyncDelay } from '../utils';
import librarySagas from '../library/sagas';
import path from 'path';
import platformSagas from '../platform/sagas';
import projectSagas from '../project/sagas';


function* watchLazyUpdateInputValue() {
  yield takeLatest(actions.LAZY_UPDATE_INPUT_VALUE, function* ({ key, value, delay}) {
    yield call(asyncDelay, delay);
    yield put(actions.updateInputValue(key, value));
  });
}

function* watchEventActions() {
  const re = new RegExp('^(install|uninstall|update|open|remove)_(library|platform|project)', 'i');
  yield takeEvery('*', function* (action) {
    if (!re.test(action.type)) {
      return;
    }
    let label = '';
    if (action.type.endsWith('_LIBRARY')) {
      label = action.lib || (action.pkgDir ? path.basename(action.pkgDir) : '');
    }
    else if (action.type.endsWith('_PLATFORM')) {
      label = action.platform || (action.pkgDir ? path.basename(action.pkgDir) : '');
    }
    yield fork(Telemetry.hitEvent, 'Home', action.type, label);
  });
}

export default function* root() {
  yield [
    watchLazyUpdateInputValue,
    watchEventActions,
    ...librarySagas,
    ...projectSagas,
    ...platformSagas
  ].map(item => fork(item));
}
