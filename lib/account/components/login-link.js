/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';

import { maybeAuthModal } from '../helpers';


export default class UserStatus extends React.Component {
  static propTypes = {
    onLoginDialogClose: React.PropTypes.func,
  }

  async onClick() {
    await maybeAuthModal();
    this.props.onLoginDialogClose();
  }

  render() {
    return <a onClick={ ::this.onClick }>Log in to PlatformIO</a>;
  }
}
