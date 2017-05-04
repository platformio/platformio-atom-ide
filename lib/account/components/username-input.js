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
    onChange: React.PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = {
      username: '',
    };
  }

  componentDidMount() {
    if (!this.state.username) {
      const newUsername = this.props.initial || '';
      this.setState({
        username: newUsername,
      });
      this.props.onChange(newUsername);
    }
  }

  handleChange(event) {
    this.setState({
      username: event.target.value,
    });
    this.props.onChange(event.target.value);
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
               title='Please enter you username'
               placeholder='example@gmail.com' />
           </div>;
  }
}
