/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import { Route, Switch } from 'react-router';

import ForgotPasswordFormContainer from '../containers/forgot-password-form-container';
import LoginFormContainer from '../containers/login-form-container';
import { MemoryRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import React from 'react';
import RegisterFormContainer from '../containers/register-form-container';
import { getStore } from '../../core/store';

export const LOGIN_FORM = 'login';
export const REGISTER_FORM = 'register';
export const FORGOT_FORM = 'forgot';


export default class AuthContainer extends React.Component {

  static propTypes = {
    onResolve: PropTypes.func.isRequired,
    formType: PropTypes.string,
  };

  render() {
    return (
      <Provider store={ getStore() }>
        <MemoryRouter initialEntries={ [`/auth/${this.props.formType}`] }>
          <div className='auth-modal pio-native-key-bindings-tab-fix native-key-bindings' tabIndex='1'>
            <Switch>
              <Route path={ `/auth/${LOGIN_FORM}` } render={ (props) => <LoginFormContainer {...this.props} {...props} /> } />
              <Route path={ `/auth/${REGISTER_FORM}` } render={ (props) => <RegisterFormContainer {...this.props} {...props} /> } />
              <Route path={ `/auth/${FORGOT_FORM}` } render={ (props) => <ForgotPasswordFormContainer {...this.props} {...props} /> } />
            </Switch>
            <a onClick={ this.props.onResolve } className='skip-button inline-block'>Skip</a>
          </div>
        </MemoryRouter>
      </Provider>);
  }

}
