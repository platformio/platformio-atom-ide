/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition */

import { fork, takeEvery } from 'redux-saga/effects';

import Telemetry from '../telemetry';
import path from 'path';


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

export default [
  watchEventActions
];
