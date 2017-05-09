/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PasswordInput from './password-input';
import PropTypes from 'prop-types';
import React from 'react';

export default class PasswordModalComponent extends React.Component {

  static propTypes = {
    onResolve: PropTypes.func.isRequired,
  }

  constructor() {
    super(...arguments);

    this.state = {
      password: '',
    };
  }

  handlePasswordChange(password) {
    this.setState({
      password: password,
    });
  }

  onComplete() {
    this.props.onResolve({
      success: true,
      password: this.state.password,
    });
  }

  onCancel() {
    this.props.onResolve({
      success: false,
    });
  }

  render() {
    return (
      <div>
        <h1>Account Password</h1>
        <div className='text'>
          <span className='icon icon-question'></span> Please enter PIO Account Password to fetch a <b>Personal Authentication Token</b>
        </div>
        <form onSubmit={ ::this.onComplete }>
          <PasswordInput label=' ' value={ this.state.password } onChange={ ::this.handlePasswordChange } />
          <div className='block text-right'>
            <button type='reset' onClick={ ::this.onCancel } className='inline-block btn btn-lg'>Cancel</button>
            <button type='submit' onClick={ ::this.onComplete } className='inline-block btn btn-lg btn-primary'>
              Complete
            </button>
          </div>
        </form>
      </div>);
  }

}
