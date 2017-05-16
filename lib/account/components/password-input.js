/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';


export default class PasswordInput extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    label: PropTypes.string,
    title: PropTypes.string,
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
      <div className='form-group password-input'>
        <label className='control-label'>
          { this.props.label || 'Password' }
        </label>
        <input type='password'
          value={ this.props.value }
          onChange={ this.handleChange }
          className='form-control input-text'
          title={ this.props.title || 'Please enter your password' } />
      </div>);
  }
}
