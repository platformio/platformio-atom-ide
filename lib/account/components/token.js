/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';


export default class Token extends React.Component {

  static propTypes = {
    token: PropTypes.string.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    tokenFetchFormOpenRequest: PropTypes.func.isRequired,
    onCopyClick: PropTypes.func.isRequired,
    isCopyDisabled: PropTypes.bool.isRequired,
  }

  constructor() {
    super(...arguments);

    this.handleShowClick = ::this.handleShowClick;
    this.handleRegenerateClick = ::this.handleRegenerateClick;
  }

  handleShowClick() {
    this.props.tokenFetchFormOpenRequest(false);
  }

  handleRegenerateClick() {
    this.props.tokenFetchFormOpenRequest(true);
  }

  render() {
    return (
      <div className='token-page block'>
        <div className='block text'>
          <span className='icon icon-question'></span> Show or regenerate <b>Personal Authentication Token</b>. It is very useful for <a href='http://docs.platformio.org/page/ci/index.html#ci'>Continuous Integration</a>    systems,
          <a href='http://docs.platformio.org/page/plus/pio-remote.html#pio-remote'>PIO Remote™</a> operations where you are not able to authorize manually. PlatformIO
          handles <b>Personal Authentication Token</b> from an environment variable <a href='http://docs.platformio.org/page/envvars.html#envvar-PLATFORMIO_AUTH_TOKEN'>PLATFORMIO_AUTH_TOKEN</a>.
        </div>
        <div className='block'>
          <input type='text'
            value={ this.props.token }
            disabled={ true }
            className='inline-block input-text token-place' />
          <button onClick={ this.props.onCopyClick } disabled={ this.props.isCopyDisabled } className='inline-block btn btn-primary icon icon-clippy'>
            Copy
          </button>
        </div>
        <button onClick={ this.handleShowClick } disabled={ !this.props.isLoggedIn } className='inline-block btn btn-primary icon icon-eye'>
          Show
        </button>
        <button onClick={ this.handleRegenerateClick } disabled={ !this.props.isLoggedIn } className='inline-block btn btn-primary icon icon-sync'>
          Regenerate
        </button>
      </div>);
  }
}
