/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
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
import { getStore } from '../core/store';


export default class HomeIndex {

  constructor(uri) {
    this.uri = uri;
    this.element = document.createElement('div');

    let startLocation = this.uri.replace('platformio://home', '');
    if (!startLocation) {
      startLocation = '/';
    }

    ReactDOM.render(
      <Provider store={ getStore() }>
        <MemoryRouter initialEntries={ [startLocation] }>
          <HomeApp />
        </MemoryRouter>
      </Provider>,
      this.element
    );

    Telemetry.hitScreenView(startLocation);
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this.element);
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
