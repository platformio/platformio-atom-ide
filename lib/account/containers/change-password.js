/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';

import ChangePassword from '../components/change-password';
import React from 'react';
import { runPioAccountChangePassword } from '../helpers';


export default class ChangePasswordPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
    };
  }

  async handleSubmit({oldPassword, newPassword}) {
    if (this.state.disabled) {
      return;
    }
    this.setState({
      disabled: true,
    });
    try {
      await runPioAccountChangePassword(oldPassword, newPassword);
      atom.notifications.addSuccess('Password changed successfully.');
    } catch (error) {
      utils.notifyError('Failed to change password.', error.toString());
    }
  }

  render() {
    return <ChangePassword submitDisabled={ this.state.disabled } onSubmit={ ::this.handleSubmit } />;
  }

}
