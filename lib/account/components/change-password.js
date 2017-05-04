/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PasswordInput from './password-input';
import React from 'react';


export default class ChangePassword extends React.Component {

  static propTypes = {
    submitDisabled: React.PropTypes.bool,
    onSubmit: React.PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      oldPassword: '',
      newPassword: '',
    };
  }

  onSubmit() {
    this.props.onSubmit({
      oldPassword: this.state.oldPassword,
      newPassword: this.state.newPassword,
    });
  }

  handleOldPasswordChange(value) {
    this.setState({
      oldPassword: value,
    });
  }

  handleNewPasswordChange(value) {
    this.setState({
      newPassword: value,
    });
  }

  render() {
    return <form onSubmit={ ::this.onSubmit } className='native-key-bindings'>
             <PasswordInput label='Old Password' onChange={ ::this.handleOldPasswordChange } />
             <PasswordInput label='New Password' onChange={ ::this.handleNewPasswordChange } />
             <button onClick={ ::this.onSubmit } disabled={ this.props.submitDisabled ? 'disabled' : '' } className='inline-block btn btn-lg btn-primary'>
               Submit
             </button>
           </form>;
  }
}
