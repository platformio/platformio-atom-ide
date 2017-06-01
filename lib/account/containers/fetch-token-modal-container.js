/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */



import FetchTokenFormContainer from '../containers/fetch-token-form-container';
import { Provider } from 'react-redux';
import React from 'react';
import { getStore } from '../../core/store';



export default class FetchTokenModalContainer extends React.Component {

  render() {
    return (
      <Provider store={ getStore() }>
        <FetchTokenFormContainer {...this.props} />
      </Provider>);
  }

}
