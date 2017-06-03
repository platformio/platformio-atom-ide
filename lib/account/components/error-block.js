/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';


export default class ErrorBlock extends React.Component {
  static propTypes = {
    error: PropTypes.string,
  }


  render() {
    if (!this.props.error) {
      return null;
    }
    return (
      <div className='error-block native-key-bindings' tabIndex='-1'>
        <pre className='error-messages'>{ this.props.error }</pre>
      </div>);
  }
}
