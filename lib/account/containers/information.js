/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { getAccountStatus, maybeAuthModal } from '../helpers';

import AccountInfo from '../components/info';
import React from 'react';


export default class InformationPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      info: '',
      error: '',
      loggedIn: false,
    };
  }

  async componentDidMount() {
    try {
      const info = await getAccountStatus();
      this.setState({
        info: info,
      });
    } catch (error) {
      this.setState({
        error: error.toString(),
      });
    }
  }

  render() {
    if (this.state.info) {
      return <AccountInfo data={ this.state.info } />;
    } else if (this.state.error) {
      return (
        <div>
          <div className='text-right'>
            <button onClick={ () => maybeAuthModal('REGISTER') } className='btn btn-primary icon icon-person'>
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
