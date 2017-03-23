/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';


export default class LibraryDetailHeaders extends React.Component {

  static propTypes = {
    items: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  }

  render() {
    return (
      <div className='lib-headers'>
        { !this.props.items.length &&
          <ul className='background-message text-center'>
            <li>
              No headers
            </li>
          </ul> }
        <ul>
          { this.props.items.map(header => (
              <li onClick={ () => atom.clipboard.write(header) }>
                <a><span title='Copy to clipboard' className='icon icon-clippy'></span></a> <span className='inline-block highlight'>{ header }</span>
              </li>
            )) }
        </ul>
      </div>
    );
  }
}
