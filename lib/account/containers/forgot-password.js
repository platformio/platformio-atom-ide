/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';
import { getUsername, runPioAccountForgotPassword } from '../helpers';

import ForgotPassword from '../components/forgot-password';
import React from 'react';


export default class ForgotPasswordPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      initialUsername: '',
      disabled: false,
    };
  }

  async handleSubmit({username}) {
    if (this.state.disabled) {
      return;
    }
    this.setState({
      disabled: true,
    });
    try {
      await runPioAccountForgotPassword(username);
      atom.notifications.addSuccess('Password reset request has been submitted.');
    } catch (error) {
      utils.notifyError('Failed to reset password.', error.toString());
    }
  }

  componentDidMount() {
    this.setState({
      initialUsername: getUsername(),
    });
  }

  render() {
    return (
      <div>
        <ForgotPassword initialUsername={ this.state.initialUsername } submitDisabled={ this.state.disabled } onSubmit={ ::this.handleSubmit } />
      </div>);
  }

}
