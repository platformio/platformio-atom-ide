/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ErrorBlock from '../components/error-block';
import MaybeInProgressButton from '../components/maybe-in-progress-button';
import PropTypes from 'prop-types';
import React from 'react';
import UsernameInput from '../components/username-input';


export default class ForgotPasswordForm extends React.Component {

  static propTypes = {
    forgotPasswordRequest: PropTypes.func.isRequired,
    onRegisterClick: PropTypes.func.isRequired,
    initialUsername: PropTypes.string,
    error: PropTypes.string,
    isAuthRequestInProgress: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    isAuthRequestInProgress: false,
  }

  constructor() {
    super(...arguments);

    this.state = {
      username: this.props.initialUsername || '',
    };

    this.handleUsernameChange = ::this.handleUsernameChange;
    this.handleSubmit = ::this.handleSubmit;
  }

  handleUsernameChange(username) {
    this.setState({
      username,
    });
  }

  handleSubmit() {
    this.props.forgotPasswordRequest(this.state.username);
  }

  handleSkip() {}

  render() {
    return (
      <div>
        <div className='header'>
          <h1>Forgot Password</h1>
        </div>
        <form onSubmit={ this.handleSubmit }>
          <UsernameInput value={ this.state.username } onChange={ this.handleUsernameChange } />
          <div className='block'>
            <MaybeInProgressButton type='submit' isInProgress={ this.props.isAuthRequestInProgress } className='auth-complete-button btn btn-lg btn-primary'>
              Submit
            </MaybeInProgressButton>
          </div>
        </form>
        <p>
          Do not have an account?
          <br/>
          <a onClick={ this.props.onRegisterClick }>Create one for FREE!</a>
        </p>
        <ErrorBlock error={ this.props.error } />
      </div>);
  }

}
