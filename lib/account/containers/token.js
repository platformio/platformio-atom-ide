/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import * as utils from '../../utils';
import { isUserLoggedIn, runPioToken } from '../helpers';

import PasswordModal from '../containers/password-modal';
import React from 'react';
import Token from '../components/token';


export default class TokenPage extends React.Component {

  constructor() {
    super(...arguments);

    this.tokenPlaceholder = '•'.repeat(40);

    this.state = {
      token: this.tokenPlaceholder,
      isTokenFetched: false,
      isUserLoggedIn: false,
    };
  }

  componentDidMount() {
    this.setState({
      isUserLoggedIn: isUserLoggedIn(),
    });
  }

  async onGetClick() {
    try {
      const modal = new PasswordModal();
      const {success, password} = await modal.open();
      if (success) {
        const {status, result} = await runPioToken(password, false);
        if (status === 'success') {
          this.setState({
            token: result,
            isTokenFetched: true,
          });
          atom.notifications.addSuccess('Token has been fetched successfully.');
        }
      }
    } catch (error) {
      atom.notifications.addError('Failed to fetch token', {
        detail: error.toString()
      });
    }
  }

  async onRegenerateClick() {
    try {
      const modal = new PasswordModal();
      const {success, password} = await modal.open();
      if (success) {
        const {status, result} = await runPioToken(password, true);
        if (status === 'success') {
          this.setState({
            token: result,
            isTokenFetched: true,
          });
          atom.notifications.addSuccess('Token has been regenerated successfully.');
        }
      }
    } catch (error) {
      utils.notifyError('Failed to get password', error);
    }
  }

  onCopyClick() {
    if (this.state.isTokenFetched) {
      atom.clipboard.write(this.state.token);
      atom.notifications.addSuccess('Token has been copied to clipboard.');
    }
  }

  render() {
    return (
      <div className='token-page'>
        <Token token={ this.state.token }
          onGetClick={ ::this.onGetClick }
          isGetDisabled={ !this.state.isUserLoggedIn }
          onRegenerateClick={ ::this.onRegenerateClick }
          isRegenerateDisabled={ !this.state.isUserLoggedIn }
          onCopyClick={ ::this.onCopyClick }
          isCopyDisabled={ !this.state.isUserLoggedIn || !this.state.isTokenFetched } />
      </div>);
  }

}
