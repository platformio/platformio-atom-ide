/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';

import { resetStore } from './actions';
import rootReducer from './reducers';
import rootSaga from './sagas';


const SERIALIZE_KEYS = [
  'inputValues',
  'flags',
];
let storeInstance = null;

export function getStore() {
  if (!storeInstance) {
    initStore();
  }
  return storeInstance;
}

export function initStore(preloadedState) {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware];
  try {
    middlewares.push(require('redux-logger').logger);
  }
  // eslint-disable-next-line no-empty
  catch (_) {}
  const store = createStore(
    rootReducer,
    preloadedState || {},
    applyMiddleware(...middlewares)
  );
  store.close = () => store.dispatch(END);
  sagaMiddleware.run(rootSaga);
  storeInstance = store;
  return store;
}

export function serializeStore() {
  if (!storeInstance) {
    return {};
  }
  const state = storeInstance.getState();
  const result = {};
  SERIALIZE_KEYS.forEach(key => {
    if (state.hasOwnProperty(key)) {
      result[key] = state[key];
    }
  });
  return result;
}

export function destroyStore() {
  if (!storeInstance) {
    return;
  }
  storeInstance.dispatch(resetStore());
  storeInstance.close();
  storeInstance = null;
}
