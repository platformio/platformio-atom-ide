/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ErrorBlock from '../components/error-block';
import MaybeInProgressButton from '../components/maybe-in-progress-button';
import PasswordInput from './password-input';
import PropTypes from 'prop-types';
import React from 'react';

export default class FetchTokenForm extends React.Component {

  static propTypes = {
    tokenFetchRequest: PropTypes.func.isRequired,
    regenerate: PropTypes.bool.isRequired,
    error: PropTypes.string,
    isTokenFetchInProgress: PropTypes.bool.isRequired,
    onResolve: PropTypes.bool.isRequired,
  }

  constructor() {
    super(...arguments);

    this.handlePasswordChange = ::this.handlePasswordChange;
    this.handleCancelClick = ::this.handleCancelClick;
    this.handleSubmit = ::this.handleSubmit;

    this.state = {
      password: '',
    };
  }

  handlePasswordChange(password) {
    this.setState({
      password: password,
    });
  }

  handleCancelClick() {
    this.props.onResolve();
  }

  handleSubmit() {
    this.props.tokenFetchRequest(this.state.password, this.props.regenerate);
  }

  render() {
    return (
      <div>
        <h1>Account Password</h1>
        <div className='text'>
          <span className='icon icon-question'></span> Please enter PIO Account Password to fetch a <b>Personal Authentication Token</b>
        </div>
        <form onSubmit={ this.handleSubmit }>
          <PasswordInput label=' ' value={ this.state.password } onChange={ this.handlePasswordChange } />
          <div className='block text-right'>
            <button type='reset'
              disabled={ this.props.isTokenFetchInProgress }
              onClick={ this.handleCancelClick }
              className=' inline-block btn btn-lg'>
              Cancel
            </button>
            <MaybeInProgressButton type='submit' isInProgress={ this.props.isTokenFetchInProgress } className='inline-block btn btn-lg btn-primary'>
              Complete
            </MaybeInProgressButton>
          </div>
        </form>
        <ErrorBlock error={ this.props.error } />
      </div>);
  }

}
