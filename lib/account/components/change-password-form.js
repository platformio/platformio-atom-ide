/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import MaybeInProgressButton from '../components/maybe-in-progress-button';
import PasswordInput from '../components/password-input';
import PropTypes from 'prop-types';
import React from 'react';


export default class ChangePasswordForm extends React.Component {

  static propTypes = {
    passwordChangeRequest: PropTypes.func.isRequired,
    isLoggedIn: PropTypes.func.isRequired,
    isPasswordChangeInProgress: PropTypes.func.isRequired,
  }

  constructor() {
    super(...arguments);

    this.handleSubmit = ::this.handleSubmit;
    this.handleOldPasswordChange = ::this.handleOldPasswordChange;
    this.handleNewPasswordChange = ::this.handleNewPasswordChange;

    this.state = {
      oldPassword: '',
      newPassword: '',
    };
  }

  handleSubmit() {
    this.props.passwordChangeRequest(this.state.oldPassword, this.state.newPassword);
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
      <div className='change-password'>
        <h1 className='block section-heading icon icon-lock'>Change Password</h1>
        <form onSubmit={ this.handleSubmit }>
          <PasswordInput value={ this.state.oldPassword }
            label='Old Password'
            title='Please enter your current password'
            onChange={ this.handleOldPasswordChange } />
          <PasswordInput value={ this.state.newPassword }
            label='New Password'
            title='Please enter your new password'
            onChange={ this.handleNewPasswordChange } />
          <MaybeInProgressButton type='submit' isInProgress={ this.props.isPasswordChangeInProgress } className='inline-block btn btn-primary'>
            Submit
          </MaybeInProgressButton>
        </form>
      </div>);
  }

}
