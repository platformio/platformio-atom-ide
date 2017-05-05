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
    isTokenFetched: React.PropTypes.bool,
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
        <div className='row block'>
          <div className='col-xs-6'>
            <pre className={ this.props.isTokenFetched ? 'selectable' : 'non-selectable' }>{ this.props.token }</pre>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-6'>
            <div className='token-buttons'>
              <button onClick={ this.props.onGetClick } disabled={ this.props.isGetDisabled } className='inline-block btn btn-lg btn-primary icon icon-arrow-down'>
                Get
              </button>
              <button onClick={ this.props.onRegenerateClick } disabled={ this.props.isRegenerateDisabled } className='inline-block btn btn-lg btn-primary icon icon-sync'>
                Regenerate
              </button>
              <button onClick={ this.props.onCopyClick } disabled={ this.props.isCopyDisabled } className='inline-block btn btn-lg btn-primary icon icon-clippy'>
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>);
  }
}
