/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Dropdown, { DropdownContent, DropdownTrigger } from 'react-simple-dropdown';

import PropTypes from 'prop-types';
import React from 'react';


export default class UserStatus extends React.Component {

  static propTypes = {
    shortUsername: PropTypes.string,
    logoutRequest: PropTypes.func,
    goTo: PropTypes.func.isRequired,
    info: PropTypes.object.isRequired,
  }

  constructor() {
    super(...arguments);

    this.handleLinkClick = ::this.handleLinkClick;
    this.handleLogoutClick = ::this.handleLogoutClick;
  }

  handleLinkClick(event) {
    this.props.goTo(event.target.dataset.location);
    this.dropdown.hide();
  }

  handleLogoutClick() {
    this.props.logoutRequest();
    this.dropdown.hide();
  }

  render() {
    return (
      <Dropdown className='user-status' ref={ e => this.dropdown = e }>
        <DropdownTrigger>
          <span className='icon icon-person'></span>
          <a className='username'>
            { this.props.shortUsername }
          </a>
          <span className='arrow-icon icon icon-chevron-down'></span>
        </DropdownTrigger>
        <DropdownContent>
          <ul className='list-group'>
            <li className='list-item'>
              <a data-location='/account' onClick={ this.handleLinkClick }>Account</a>
            </li>
            { this.props.info.upgradePlan &&
              <li className='list-item'>
                <a className='' href='https://pioplus.com/pricing.html'>Upgrade Your Account</a>
              </li> }
            <li className='list-item'>
              <a onClick={ this.handleLogoutClick }>Log Out</a>
            </li>
          </ul>
        </DropdownContent>
      </Dropdown>);
  }
}
