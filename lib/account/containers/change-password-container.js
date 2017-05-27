/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { CHANGE_PASSWORD_ERROR_KEY, getIsLoggedIn, getIsPasswordChangeInProgress } from '../selectors';

import ChangePasswordForm from '../components/change-password-form';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteError } from '../../core/actions';
import { getError } from '../../core/selectors';


const ChangePasswordContainer = connect(mapStateToProps, mapDispatchToProps)(ChangePasswordForm);

function mapStateToProps(state) {
  return {
    isLoggedIn: getIsLoggedIn(state),
    isPasswordChangeInProgress: getIsPasswordChangeInProgress(state),
    error: getError(state, CHANGE_PASSWORD_ERROR_KEY),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...actions,
    deleteError: () => deleteError(/^changePassword/),
  }, dispatch);
}

export default ChangePasswordContainer;
