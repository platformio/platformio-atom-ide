/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { getAccountInformation, getIsLoggedIn } from '../selectors';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';


class UpgradeTopContainer extends React.Component {

  static propTypes = {
    authFormOpenRequest: PropTypes.func.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    info: PropTypes.object
  }

  render() {
    if (this.props.isLoggedIn && this.props.info && !this.props.info.upgradePlan) {
      return null;
    }
    return (
      <div className='account-upgrade-top'>
        <a href='http://platformio.org/pricing?utm_source=ide&utm_medium=atom&utm_campaign=top' title='Upgrade to PIO Plus'>UPGRADE</a>
      </div>
    );
  }

}


function mapStateToProps(state) {
  return {
    isLoggedIn: getIsLoggedIn(state),
    info: getAccountInformation(state),
  };
}


export default connect(mapStateToProps, actions)(UpgradeTopContainer);
