/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition */

import * as actions from './actions';

import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { getRecentProjects, removeRecentProject, synchronizeRecentProjects } from './helpers';

import { asyncDelay } from '../utils';
import { getProjects } from './selectors';
import { updateEntity } from '../core/actions';


function* reloadProjects() {
  yield put(updateEntity('projects', getRecentProjects()));
}

function* watchSyncProjects() {
  yield takeLatest(actions.SYNC_PROJECTS, function* ({items}) {
    yield call(asyncDelay, 500);
    synchronizeRecentProjects(items);
    yield reloadProjects();
  });
}

function* watchLoadProjects() {
  yield takeLatest(actions.LOAD_PROJECTS, function* () {
    const items = yield select(getProjects);
    if (items === null) {
      yield put(updateEntity('projects', getRecentProjects()));
    }
  });
}

function* watchOpenProject() {
  yield takeEvery(actions.OPEN_PROJECT, function ({ projectPath }) {
    atom.project.addPath(projectPath);
  });
}

function* watchRemoveProjects() {
  yield takeEvery(actions.REMOVE_PROJECT, function* ({ projectPath }) {
    atom.project.removePath(projectPath);
    removeRecentProject(projectPath);
    yield reloadProjects();
  });
}

export default [
  watchSyncProjects,
  watchLoadProjects,
  watchOpenProject,
  watchRemoveProjects
];
