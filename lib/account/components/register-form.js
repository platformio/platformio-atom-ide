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
import PropTypes from 'prop-types';
import React from 'react';
import UsernameInput from '../components/username-input';


export default class RegisterForm extends React.Component {

  static propTypes = {
    registerRequest: PropTypes.func.isRequired,
    onLoginClick: PropTypes.func.isRequired,
    error: PropTypes.string,
    isAuthRequestInProgress: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    isAuthRequestInProgress: false,
  }

  constructor() {
    super(...arguments);

    this.state = {
      username: '',
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
    this.props.registerRequest(this.state.username);
  }

  render() {
    return (
      <div>
        <div className='header'>
          <h1>Create a Free PIO Account</h1>
        </div>
        <div className='block'>
          <b>PIO Account</b> opens access to the extra professional features:
          <ul className='info-messages'>
            <li>
              <a href='http://docs.platformio.org/page/plus/pio-remote.html'>PIO Remote™</a>
            </li>
            <li>
              <a href='http://docs.platformio.org/page/plus/unit-testing.html'>Unit Testing</a>
            </li>
            <li>
              <a href='http://docs.platformio.org/page/ide.html#ide-cloud'>Cloud IDEs</a>
            </li>
            <li>
              <a href='http://docs.platformio.org/page/plus/debugging.html'>PIO Unified Debugger</a>
            </li>
          </ul>
          <br />
        </div>
        <form onSubmit={ this.handleSubmit }>
          <UsernameInput value={ this.state.username } onChange={ this.handleUsernameChange } />
          <div className='block'>
            <MaybeInProgressButton type='submit' isInProgress={ this.props.isAuthRequestInProgress } className='auth-complete-button btn btn-lg btn-primary'>
              Register
            </MaybeInProgressButton>
          </div>
        </form>
        <p>
          Already have an account? <a onClick={ this.props.onLoginClick }>Login now!</a>
        </p>
        <ErrorBlock error={ this.props.error } />
      </div>);
  }

}
