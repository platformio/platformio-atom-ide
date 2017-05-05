/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PasswordInput from './password-input';
import React from 'react';

export default class PasswordModalComponent extends React.Component {

  static propTypes = {
    onResolve: React.PropTypes.func.isRequired,
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
      <div className='password-request-modal native-key-bindings' tabIndex='1'>
        <h1>Password</h1>
        <form onSubmit={ ::this.onComplete }>
          <PasswordInput value={ this.state.password } onChange={ ::this.handlePasswordChange } />
          <div className='password-request-modal-buttons'>
            <button onClick={ ::this.onComplete } className='btn btn-lg btn-primary'>
              Complete
            </button>
            <a onClick={ ::this.onCancel } className='cancel-button'>Cancel</a>
          </div>
        </form>
      </div>);
  }

}
