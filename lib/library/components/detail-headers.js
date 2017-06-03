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


export default class LibraryDetailHeaders extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired
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
              <li key={ header } onClick={ () => atom.clipboard.write(header) }>
                <a><span title='Copy to clipboard' className='icon icon-clippy'></span></a> <span className='inline-block highlight'>{ header }</span>
              </li>
            )) }
        </ul>
      </div>
    );
  }
}
