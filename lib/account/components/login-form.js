/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ErrorBlock from '../components/error-block';
import MaybeInProgressButton from '../components/maybe-in-progress-button';
import PasswordInput from '../components/password-input';
import PlatformIOLogo from '../../home/components/pio-logo';
import PropTypes from 'prop-types';
import React from 'react';
import UsernameInput from '../components/username-input';


export default class LoginForm extends React.Component {

  static propTypes = {
    initialUsername: PropTypes.string,
    error: PropTypes.string,
    loginRequest: PropTypes.func.isRequired,
    onRegisterClick: PropTypes.func.isRequired,
    onForgotClick: PropTypes.func.isRequired,
    isAuthRequestInProgress: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    isAuthRequestInProgress: false,
  }

  constructor() {
    super(...arguments);

    this.state = {
      username: this.props.initialUsername || '',
      password: '',
    };

    this.handleUsernameChange = ::this.handleUsernameChange;
    this.handlePasswordChange = ::this.handlePasswordChange;
    this.handleSubmit = ::this.handleSubmit;
  }

  handleUsernameChange(username) {
    this.setState({
      username,
    });
  }

  handlePasswordChange(password) {
    this.setState({
      password,
    });
  }

  handleSubmit() {
    this.props.loginRequest(this.state.username, this.state.password);
  }

  render() {
    return (
      <div>
        <div className='header'>
          <PlatformIOLogo />
        </div>
        <form onSubmit={ this.handleSubmit }>
          <UsernameInput value={ this.state.username } onChange={ this.handleUsernameChange } />
          <PasswordInput value={ this.state.password } onChange={ this.handlePasswordChange } />
          <div className='block'>
            <MaybeInProgressButton type='submit' isInProgress={ this.props.isAuthRequestInProgress } className='auth-complete-button btn btn-lg btn-primary'>
              Log In
            </MaybeInProgressButton>
          </div>
        </form>
        <div className='block'>
          <a onClick={ this.props.onForgotClick } className='forgot-password-link'>Forgot password?</a>
        </div>
        <p>
          Do not have an account?
          <br/>
          <a onClick={ this.props.onRegisterClick }>Create one for FREE!</a>
        </p>
        <ErrorBlock error={ this.props.error } />
      </div>);
  }

}
