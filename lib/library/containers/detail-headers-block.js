/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import LibraryDetailHeaders from '../components/detail-headers';
import React from 'react';
import klaw from 'klaw';
import path from 'path';


export default class LibraryDetailHeadersBlock extends React.Component {

  static propTypes = {
    data: React.PropTypes.shape({
      headers: React.PropTypes.arrayOf(React.PropTypes.string),
      __pkg_dir: React.PropTypes.string
    }).isRequired
  }

  componentWillMount() {
    if (this.props.data.headers) {
      this.setState({
        items: this.props.data.headers
      });
    }
    else if (this.props.data.__pkg_dir) {
      this.scanLibHeaders(this.props.data.__pkg_dir).then(items => {
        this.setState({
          items
        });
      });
    }
  }

  scanLibHeaders(libDir) {
    return new Promise(resolve => {
      const items = [];
      klaw(libDir, {
        filter: item => {
          return !['test', 'tests', 'example', 'examples'].includes(path.basename(item));
        }
      })
        .on('data', function(item) {
          if (!['.h', '.hpp'].includes(path.extname(item.path))) {
            return;
          }
          if (items.includes(path.basename(item.path))) {
            return;
          }
          items.push(path.basename(item.path));
        })
        .on('end', function() {
          resolve(items);
        });
    });
  }

  render() {
    return (
      <div className='lib-headers'>
        <LibraryDetailHeaders items={ this.state ? this.state.items : [] } />
      </div>
    );
  }

}
