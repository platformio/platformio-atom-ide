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


export default class UsernameInput extends React.Component {

  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
  }

  constructor() {
    super(...arguments);

    this.handleChange = ::this.handleChange;
  }

  handleChange(event) {
    this.props.onChange(event.target.value);
  }

  render() {
    return (
      <div className='form-group username-input'>
        <label className='control-label'>
          Username
        </label>
        <input type='text'
          value={ this.props.value }
          onChange={ this.handleChange }
          className='form-control input-text'
          title='Please enter you username/e-mail'
          placeholder='example@gmail.com' />
      </div>);
  }
}
