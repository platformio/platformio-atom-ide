/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import UsernameInput from './username-input';


export default class ForgotPassword extends React.Component {
  static propTypes = {
    initialUsername: React.PropTypes.string,
    submitDisabled: React.PropTypes.bool,
    onSubmit: React.PropTypes.func,
  }

  constructor() {
    super(...arguments);

    this.state = {
      username: '',
      isUsernameValid: false,
    };
  }

  onSubmit() {
    if (this.state.isUsernameValid) {
      this.props.onSubmit({
        username: this.state.username,
      });
    }
  }

  handleUsernameChange(username) {
    this.setState({
      username: username,
    });
  }

  handleUsernameValidityChange(isValid) {
    this.setState({
      isUsernameValid: isValid,
    });
  }

  render() {
    return (
      <div className='forgot-password block'>
        <div className='row'>
          <div className='col-xs-6'>
            <h1 className='section-heading icon icon-history'>Forgot Password</h1>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-6'>
            <form className='native-key-bindings'>
              <UsernameInput initial={ this.props.initialUsername } onValidityChange={ ::this.handleUsernameValidityChange } onValueChange={ ::this.handleUsernameChange } />
              <button onClick={ ::this.onSubmit } disabled={ this.props.submitDisabled ? 'disabled' : '' } className='inline-block btn btn-lg btn-primary'>
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>);
  }
}
