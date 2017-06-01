/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { FORGOT_FORM, REGISTER_FORM } from './auth-container';
import { getIsAuthRequestInProgress, getLastUsedUsername } from '../selectors';

import ForgotPasswordForm from '../components/forgot-password-form';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getError } from '../../core/selectors';
import { goTo } from '../../core/helpers';


const ForgotPasswordFormContainer = connect(mapStateToProps, mapDispatchToProps)(ForgotPasswordForm);


function mapStateToProps(state, ownProps) {
  return {
    initialUsername: getLastUsedUsername(state),
    error: getError(state, FORGOT_FORM),
    isAuthRequestInProgress: getIsAuthRequestInProgress(state),
    onRegisterClick: () => goTo(ownProps.history, `/auth/${REGISTER_FORM}`),
  };
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}


export default ForgotPasswordFormContainer;
