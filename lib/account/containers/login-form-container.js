/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { FORGOT_FORM, LOGIN_FORM, REGISTER_FORM } from './auth-container';
import { getIsAuthRequestInProgress, getLastUsedUsername } from '../selectors';

import LoginForm from '../components/login-form';
import { connect } from 'react-redux';
import { getError } from '../../core/selectors';
import { goTo } from '../../core/helpers';


const LoginFormContainer = connect(mapStateToProps, actions)(LoginForm);


function mapStateToProps(state, ownProps) {
  return {
    initialUsername: getLastUsedUsername(state),
    error: getError(state, LOGIN_FORM),
    isAuthRequestInProgress: getIsAuthRequestInProgress(state),
    onRegisterClick: () => goTo(ownProps.history, `/auth/${REGISTER_FORM}`),
    onForgotClick: () => goTo(ownProps.history, `/auth/${FORGOT_FORM}`),
  };
}


export default LoginFormContainer;
