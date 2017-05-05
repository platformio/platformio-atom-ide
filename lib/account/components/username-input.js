/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';


export default class UsernameInput extends React.Component {
  static propTypes = {
    initial: React.PropTypes.string,
    onValueChange: React.PropTypes.func,
    onValidityChange: React.PropTypes.func,
  }

  constructor() {
    super(...arguments);

    this.state = {
      username: '',
    };
    this.emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  }

  componentDidMount() {
    if (!this.state.username) {
      const newUsername = this.props.initial || '';
      this.setState({
        username: newUsername,
      });
      this.notify(newUsername);
    }
  }

  handleChange(event) {
    this.setState({
      username: event.target.value,
    });
    this.notify(event.target.value);
  }

  notify(username) {
    if (this.emailRegexp.test(username)) {
      this.props.onValueChange(username);
      this.props.onValidityChange(true);
    } else {
      this.props.onValidityChange(false);
    }
  }

  render() {
    return <div className='form-group username-input'>
             <label className='control-label'>
               Username
             </label>
             <input type='text'
               value={ this.state.username }
               onChange={ ::this.handleChange }
               className='form-control input-text'
               title='Please enter you username/e-mail'
               placeholder='example@gmail.com' />
           </div>;
  }
}
