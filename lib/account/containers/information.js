/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AccountInfo from '../components/info';
import AuthModal from '../containers/auth-modal';
import React from 'react';
import { getAccountStatus } from '../helpers';


export default class InformationPage extends React.Component {

  constructor() {
    super(...arguments);

    this.state = {
      info: '',
      error: '',
      loggedIn: false,
    };
  }

  async componentDidMount() {
    // When changing tabs too quickly, the component may unmount BEFORE the
    // account status is fetched. We should not call setState() on an unmounted
    // component.
    this.shouldUpdateState = true;

    try {
      const info = await getAccountStatus({
        offline: false,
      });
      if (this.shouldUpdateState) {
        this.setState({
          info: info,
        });
      }
    } catch (error) {
      if (this.shouldUpdateState) {
        this.setState({
          error: error.toString(),
        });
      }
    }
  }

  componentWillUnmount() {
    this.shouldUpdateState = false;
  }

  async openAuthModal(formType) {
    const modal = new AuthModal({
      formType
    });
    await modal.open();
  }

  render() {
    if (this.state.info) {
      return <AccountInfo data={ this.state.info } />;
    } else if (this.state.error) {
      return (
        <div>
          <ul className='block background-message text-center'>
            <li>
              You are not logged in!
            </li>
          </ul>
          <div className='row'>
            <div className='col-xs text-right'>
              <button onClick={ () => this.openAuthModal('LOGIN') } className='btn btn-primary btn-lg'>
                Log in to PlatformIO
              </button>
            </div>
            <div className='col-xs text-left'>
              <button onClick={ () => this.openAuthModal('REGISTER') } className='btn btn-primary btn-lg'>
                Create a Free Account
              </button>
            </div>
          </div>
        </div>);
    } else {
      return (
        <ul className='background-message text-center'>
          <li>
            <span className='loading loading-spinner-small inline-block'></span> Loading...
          </li>
        </ul>);
    }
  }

}
