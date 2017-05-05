/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';
import { getShortUsername, runPioAccountLogout } from '../helpers';

import React from 'react';


export default class UserStatus extends React.Component {
  static propTypes = {
    username: React.PropTypes.string,
    onUsernameClick: React.PropTypes.func,
    onLogoutComplete: React.PropTypes.func,
  }

  constructor() {
    super(...arguments);

    this.state = {
      shortUsername: '',
    };
  }

  componentDidMount() {
    const shortUsername = getShortUsername(this.props.username);
    if (shortUsername) {
      this.setState({
        shortUsername: shortUsername,
      });
    }
    this.tooltipDisposable = atom.tooltips.add(this.usernameElement, {
      title: 'Go to Account page',
    });
  }

  componentWillUnmount() {
    this.tooltipDisposable.dispose();
    this.tooltipDisposable = null;
  }

  async onLogoutClick() {
    try {
      await runPioAccountLogout();
      atom.notifications.addSuccess('Logged out from PlatformIO successfully!');
    } catch (error) {
      utils.notifyError('Failed to logout', error);
    }
    this.props.onLogoutComplete();
  }

  onUsernameClick() {
    this.props.onUsernameClick();
  }

  render() {
    return (
      <div>
        <span className='icon icon-person'></span>
        <a className='username' ref={ (e) => this.usernameElement = e } onClick={ ::this.onUsernameClick }>
          { this.state.shortUsername }
        </a>
        (<a className='logout-link' onClick={ ::this.onLogoutClick }>logout</a>)
      </div>);
  }
}
