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

  async openRegistrationForm() {
    const modal = new AuthModal({
      formType: 'REGISTER'
    });
    await modal.open();
  }

  render() {
    if (this.state.info) {
      return <AccountInfo data={ this.state.info } />;
    } else if (this.state.error) {
      return (
        <div>
          <div className='text-right'>
            <button onClick={ ::this.openRegistrationForm } className='btn btn-primary icon icon-person'>
              Create a Free Account
            </button>
          </div>
          <pre>{ this.state.error }</pre>
        </div>);
    } else {
      return <p>
               <span className='loading loading-spinner-tiny inline-block'></span> Loading...
             </p>;
    }
  }

}
