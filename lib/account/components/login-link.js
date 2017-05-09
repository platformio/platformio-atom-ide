/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AuthModal from '../containers/auth-modal';
import PropTypes from 'prop-types';
import React from 'react';


export default class UserStatus extends React.Component {
  static propTypes = {
    onLoginDialogClose: PropTypes.func,
  }

  async onClick() {
    const modal = new AuthModal();
    await modal.open();
    this.props.onLoginDialogClose();
  }

  render() {
    return <a onClick={ ::this.onClick }>Log in to PlatformIO</a>;
  }
}
