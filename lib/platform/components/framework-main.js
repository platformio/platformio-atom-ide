/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';


export default class FrameworkDetailPage extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      name: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      homepage: PropTypes.string.isRequired,
      url: PropTypes.string,
      platforms: PropTypes.arrayOf(PropTypes.object)
    }),
    showPlatform: PropTypes.func.isRequired
  }

  render() {
    if (!this.props.data) {
      return (
        <div>
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul>
        </div>
      );
    }
    return (
      <div className='native-key-bindings' tabIndex='-1'>
        <h1 className='section-heading icon icon-gear'>{ this.props.data.title }</h1>
        <div className='block text-highlight'>
          { this.props.data.description }
        </div>
        <dl className='row inset-panel padded'>
          <dt className='col-xs-2'>Name</dt>
          <dd className='col-xs-10'>
            <a onClick={ () => atom.clipboard.write(this.props.data.name) }><span title='Copy to clipboard' className='icon icon-clippy'></span></a> <span className='inline-block highlight'>{ this.props.data.name }</span>
          </dd>
          <dt className='col-xs-2'>Homepage</dt>
          <dd className='col-xs-10'>
            <a href={ this.props.data.homepage }>
              { this.props.data.homepage }
            </a>
          </dd>
          <dt className='col-xs-2'>Documentation</dt>
          <dd className='col-xs-10'>
            <a href={ `http://docs.platformio.org/page/frameworks/${this.props.data.name}.html` }>
              { `http://docs.platformio.org/page/frameworks/${this.props.data.name}.html` }
            </a>
          </dd>
          <dt className='col-xs-2'>Vendor</dt>
          <dd className='col-xs-10'>
            <a href={ this.props.data.url }>
              { this.props.data.url }
            </a>
          </dd>
          <dt className='col-xs-2'>Platforms</dt>
          <dd className='col-xs-10 inline-buttons'>
            { this.props.data.platforms.map(item => (
                <button onClick={ () => this.props.showPlatform(item.name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { item.title }
                </button>
              )) }
          </dd>
        </dl>
      </div>
    );
  }
}
