/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';

import { createLogger } from 'redux-logger';
import rootReducer from './reducers';


export default function configureStore(preloadedState) {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(
      sagaMiddleware,
      createLogger()
    )
  );

  store.runSaga = sagaMiddleware.run;
  store.close = () => store.dispatch(END);
  return store;
}
