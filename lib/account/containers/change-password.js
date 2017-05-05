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


export default class ChangePasswordContainer extends React.Component {

  constructor() {
    super(...arguments);

    this.state = {
      submitDisabled: false,
      retryVisible: false,
    };
  }

  async handleSubmit({oldPassword, newPassword}) {
    if (this.state.submitDisabled || !oldPassword || !newPassword) {
      return;
    }
    this.setState({
      submitDisabled: true,
    });
    try {
      await runPioAccountChangePassword(oldPassword, newPassword);
      atom.notifications.addSuccess('Password changed successfully.');
    } catch (error) {
      utils.notifyError('Failed to change password.', error);
    }
    this.setState({
      retryVisible: true,
    });
  }

  onRetry() {
    if (this.state.submitDisabled) {
      this.setState({
        submitDisabled: false,
        retryVisible: false,
      });
    } else {
      this.setState({
        submitDisabled: true,
        retryVisible: true,
      });
    }
  }

  render() {
    return <ChangePassword submitDisabled={ this.state.submitDisabled }
             retryVisible={ this.state.retryVisible }
             onRetry={ ::this.onRetry }
             onSubmit={ ::this.handleSubmit } />;
  }

}
