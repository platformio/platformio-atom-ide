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

import { call, fork, put, takeLatest } from 'redux-saga/effects';

import accountSagas from '../account/sagas';
import { asyncDelay } from '../utils';
import homeSagas from '../home/sagas';
import librarySagas from '../library/sagas';
import platformSagas from '../platform/sagas';
import projectSagas from '../project/sagas';


function* watchLazyUpdateInputValue() {
  yield takeLatest(actions.LAZY_UPDATE_INPUT_VALUE, function* ({ key, value, delay}) {
    yield call(asyncDelay, delay);
    yield put(actions.updateInputValue(key, value));
  });
}

export default function* root() {
  yield [
    watchLazyUpdateInputValue,
    ...accountSagas,
    ...homeSagas,
    ...librarySagas,
    ...projectSagas,
    ...platformSagas
  ].map(item => fork(item));
}
