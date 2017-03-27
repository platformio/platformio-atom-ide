/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import HomeApp from './app';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import Telemetry from '../telemetry';
import configureStore from './store';
import { resetStore } from './actions';
import rootSaga from './sagas';


export default class HomeIndex {

  constructor(uri) {
    this.uri = uri;
    this.store = configureStore();
    this.store.runSaga(rootSaga);
    this.element = document.createElement('div');

    let startLocation = this.uri.replace('platformio://home', '');
    if (!startLocation) {
      startLocation = '/';
    }

    ReactDOM.render(
      <Provider store={ this.store }>
        <MemoryRouter initialEntries={ [startLocation] }>
          <HomeApp />
        </MemoryRouter>
      </Provider>,
      this.element
    );

    Telemetry.hitScreenView('home' + startLocation);
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this.element);
    this.store.dispatch(resetStore());
    this.store.close();
    this.store = null;
  }

  getURI() {
    return this.uri;
  }

  getTitle() {
    return 'PlatformIO Home';
  }

  getIconName() {
    return 'home';
  }

}
