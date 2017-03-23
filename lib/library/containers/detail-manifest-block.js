/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';

import CodeHighlight from '../../home/components/code-highlight';
import React from 'react';


export default class LibraryDetailManifestBlock extends React.Component {

  static propTypes = {
    data: React.PropTypes.shape({
      confurl: React.PropTypes.string
    }).isRequired
  }

  onDidEdit(url) {
    if (url.startsWith('https://raw.githubusercontent.com')) {
      const matches = url.match(new RegExp('content\.com/([^/]+/[^/]+)/(.+)$'));
      if (matches) {
        return utils.openUrl(`https://github.com/${matches[1]}/blob/${matches[2]}`);
      }
    }
    utils.openUrl(url);
  }

  render() {
    const lang = this.props.data.confurl && this.props.data.confurl.endsWith('.ini') ? 'ini' : 'json';
    return (
      <div className='lib-manifest'>
        <div className='block row'>
          <div className='col-sm-10'>
            <span className='inline-block-tight'>Specification for manifests:</span>
            <span className='inline-block-tight'><a href='http://docs.platformio.org/page/librarymanager/config.html'>library.json</a>,</span>
            <span className='inline-block-tight'><a href='https://github.com/arduino/Arduino/wiki/Arduino-IDE-1.5:-Library-specification'>library.properties</a>,</span>
            <span className='inline-block-tight'><a href='http://yottadocs.mbed.com/reference/module.html'>module.json</a></span>
          </div>
          <div className='col-sm-2 text-right'>
            { this.props.data.confurl &&
              <button onClick={ () => this.onDidEdit(this.props.data.confurl) } className='btn btn-sm'>
                Edit Manifest
              </button> }
          </div>
        </div>
        { this.props.data.confurl ? (
          <CodeHighlight lang={ lang } url={ this.props.data.confurl } />
          ) : (
          <CodeHighlight lang={ lang } content={ JSON.stringify(this.props.data, null, 2) } />
          ) }
      </div>
    );
  }

}
