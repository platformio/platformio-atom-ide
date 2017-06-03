/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { LOGIN_FORM, REGISTER_FORM } from '../containers/auth-container';
import { getAccountInformation, getIsLoggedIn } from '../selectors';

import AccountInfo from '../components/info';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';


class InformationPage extends React.Component {

  static propTypes = {
    authFormOpenRequest: PropTypes.func.isRequired,
    accountInfoUpdateRequest: PropTypes.func.isRequired,
    info: PropTypes.object,
    isLoggedIn: PropTypes.bool.isRequired,
  }

  constructor() {
    super(...arguments);

    this.onLoginClick = ::this.onLoginClick;
    this.onCreateAccountClick = ::this.onCreateAccountClick;
  }

  componentDidMount() {
    if (!this.props.info.username) {
      this.props.accountInfoUpdateRequest();
    }
  }

  onLoginClick() {
    this.props.authFormOpenRequest(LOGIN_FORM);
  }

  onCreateAccountClick() {
    this.props.authFormOpenRequest(REGISTER_FORM);
  }

  render() {
    if (!this.props.info) {
      return (
        <ul className='background-message text-center'>
          <li>
            <span className='loading loading-spinner-small inline-block'></span> Loading...
          </li>
        </ul>);
    } else if (this.props.isLoggedIn) {
      return <AccountInfo {...this.props} />;
    } else {
      return (
        <div>
          <ul className='block background-message text-center'>
            <li>
              You are not logged in!
            </li>
          </ul>
          <div className='row'>
            <div className='col-xs text-right'>
              <button onClick={ this.onLoginClick } className='btn btn-primary btn-lg'>
                Log in to PlatformIO
              </button>
            </div>
            <div className='col-xs text-left'>
              <button onClick={ this.onCreateAccountClick } className='btn btn-primary btn-lg'>
                Create a Free Account
              </button>
            </div>
          </div>
        </div>);
    }
  }

}


function mapStateToProps(state) {
  return {
    info: getAccountInformation(state),
    isLoggedIn: getIsLoggedIn(state),
  };
}


export default connect(mapStateToProps, actions)(InformationPage);
