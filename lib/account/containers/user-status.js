/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { getUsername, isUserLoggedIn } from '../helpers';

import LoginLink from '../components/login-link';
import React from 'react';
import UserStatus from '../components/user-status';


export default class UserStatusContainer extends React.Component {

  static propTypes = {
    onUsernameClick: React.PropTypes.func,
  }

  constructor() {
    super(...arguments);

    this.state = {
      username: '-- username placeholder --',
      isLoggedIn: false,
    };
  }

  componentDidMount() {
    this.updateState();
  }

  updateState() {
    if (isUserLoggedIn()) {
      this.setState({
        username: getUsername(),
        isLoggedIn: true,
      });
    } else {
      this.setState({
        isLoggedIn: false,
      });
    }
  }

  onUsernameClick() {
    this.props.onUsernameClick();
  }

  render() {
    if (this.state.isLoggedIn) {
      return <UserStatus username={ this.state.username } onUsernameClick={ ::this.onUsernameClick } onLogoutComplete={ ::this.updateState } />;
    }
    return <LoginLink onLoginDialogClose={ ::this.updateState } />;
  }

}
