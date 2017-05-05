/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';


export default class Token extends React.Component {

  static propTypes = {
    token: React.PropTypes.string,
    onGetClick: React.PropTypes.func,
    isGetDisabled: React.PropTypes.bool,
    onRegenerateClick: React.PropTypes.func,
    isRegenerateDisabled: React.PropTypes.bool,
    onCopyClick: React.PropTypes.func,
    isCopyDisabled: React.PropTypes.bool,
  }

  render() {
    return (
      <div className='token-page block'>
        <div className='block text'>
          <span className='icon icon-question'></span> Show or regenerate <b>Personal Authentication Token</b>. It is very useful for <a href='http://docs.platformio.org/page/ci/index.html#ci'>Continuous Integration</a>    systems, <a href='http://docs.platformio.org/page/plus/pio-remote.html#pio-remote'>PIO Remote™</a> operations where you are not able to authorize manually.
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
        <button onClick={ this.props.onGetClick } disabled={ this.props.isGetDisabled } className='inline-block btn btn-primary icon icon-eye'>
          Show
        </button>
        <button onClick={ this.props.onRegenerateClick } disabled={ this.props.isRegenerateDisabled } className='inline-block btn btn-primary icon icon-sync'>
          Regenerate
        </button>
      </div>);
  }
}
