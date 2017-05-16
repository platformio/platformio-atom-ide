/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { getIsLoggedIn, getIsPasswordChangeInProgress } from '../selectors';

import ChangePasswordForm from '../components/change-password-form';
import { connect } from 'react-redux';


const ChangePasswordContainer = connect(mapStateToProps, actions)(ChangePasswordForm);

function mapStateToProps(state) {
  return {
    isLoggedIn: getIsLoggedIn(state),
    isPasswordChangeInProgress: getIsPasswordChangeInProgress(state),
  };
}


export default ChangePasswordContainer;
