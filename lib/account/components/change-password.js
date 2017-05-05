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


export default class ChangePassword extends React.Component {

  static propTypes = {
    submitDisabled: React.PropTypes.bool,
    retryVisible: React.PropTypes.bool,
    onSubmit: React.PropTypes.func,
    onRetry: React.PropTypes.func,
  }

  constructor() {
    super(...arguments);

    this.state = {
      oldPassword: '',
      newPassword: '',
    };
  }

  onSubmit() {
    this.props.onSubmit({
      oldPassword: this.state.oldPassword,
      newPassword: this.state.newPassword,
    });
  }

  onRetry() {
    this.setState({
      oldPassword: '',
      newPassword: '',
    });
    this.props.onRetry();
  }

  handleOldPasswordChange(value) {
    this.setState({
      oldPassword: value,
    });
  }

  handleNewPasswordChange(value) {
    this.setState({
      newPassword: value,
    });
  }

  render() {
    return (
      <div className='change-password block'>
        <div className='row'>
          <div className='col-xs-6'>
            <h1 className='section-heading icon icon-lock'>Change Password</h1>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-6'>
            <form onSubmit={ ::this.onSubmit } className='native-key-bindings'>
              <PasswordInput value={ this.state.oldPassword }
                label='Old Password'
                title='Please enter your current password'
                onChange={ ::this.handleOldPasswordChange } />
              <PasswordInput value={ this.state.newPassword }
                label='New Password'
                title='Please enter your new password'
                onChange={ ::this.handleNewPasswordChange } />
              <div className='change-password-buttons'>
                <button onClick={ ::this.onSubmit } disabled={ this.props.submitDisabled ? 'disabled' : '' } className='inline-block btn btn-lg btn-primary'>
                  Submit
                </button>
                <a onClick={ ::this.onRetry } className='retry-button text-subtle' style={ { display: this.props.retryVisible ? 'block' : 'none' } }>Retry</a>
              </div>
            </form>
          </div>
        </div>
      </div>);
  }
}
