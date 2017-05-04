/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import UsernameInput from './username-input';


export default class ForgotPassword extends React.Component {
  static propTypes = {
    initialUsername: React.PropTypes.string,
    submitDisabled: React.PropTypes.bool,
    onSubmit: React.PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      username: '',
    };
  }

  onSubmit() {
    this.props.onSubmit({
      username: this.state.username,
    });
  }

  handleUsernameChange(username) {
    this.setState({
      username: username,
    });
  }

  render() {
    return <form className='native-key-bindings'>
             <UsernameInput initial={ this.props.initialUsername } onChange={ ::this.handleUsernameChange } />
             <button onClick={ ::this.onSubmit } disabled={ this.props.submitDisabled ? 'disabled' : '' } className='inline-block btn btn-lg btn-primary'>
               Submit
             </button>
           </form>;
  }
}
