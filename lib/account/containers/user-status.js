/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { getAccountInformation, getIsLoggedIn, getLastUsedUsername } from '../selectors';

import LoginLink from '../components/login-link';
import PropTypes from 'prop-types';
import React from 'react';
import UserStatus from '../components/user-status';
import { connect } from 'react-redux';
import { getShortUsername } from '../helpers';


class UserStatusContainer extends React.Component {

  static propTypes = {
    authFormOpenRequest: PropTypes.func.isRequired,
    logoutRequest: PropTypes.func.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    shortUsername: PropTypes.string,
    goTo: PropTypes.func.isRequired,
    info: PropTypes.object,
  }

  render() {
    if (this.props.isLoggedIn) {
      return <UserStatus {...this.props} />;
    }
    return <LoginLink {...this.props} />;
  }

}


function mapStateToProps(state) {
  return {
    isLoggedIn: getIsLoggedIn(state),
    shortUsername: getShortUsername(getLastUsedUsername(state)),
    info: getAccountInformation(state),
  };
}


export default connect(mapStateToProps, actions)(UserStatusContainer);
