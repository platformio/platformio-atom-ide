/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { LOGIN_FORM, REGISTER_FORM } from './auth-container';

import RegisterForm from '../components/register-form';
import { connect } from 'react-redux';
import { getError } from '../../core/selectors';
import { getIsAuthRequestInProgress } from '../selectors';
import { goTo } from '../../core/helpers';


const RegisterFormContainer = connect(mapStateToProps, actions)(RegisterForm);


function mapStateToProps(state, ownProps) {
  return {
    error: getError(state, REGISTER_FORM),
    isAuthRequestInProgress: getIsAuthRequestInProgress(state),
    onLoginClick: () => goTo(ownProps.history, `/auth/${LOGIN_FORM}`),
  };
}


export default RegisterFormContainer;
