/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PlatformCard from './platform-card';
import React from 'react';


export default class PlatformsList extends React.Component {

  static propTypes = {
    items: React.PropTypes.arrayOf(
      React.PropTypes.object.isRequired
    ),
    filterValue: React.PropTypes.string.isRequired,
    setFilter: React.PropTypes.func.isRequired,
    actions: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    showPlatform: React.PropTypes.func.isRequired,
    showFramework: React.PropTypes.func.isRequired,
    installPlatform: React.PropTypes.func.isRequired,
    uninstallPlatform: React.PropTypes.func.isRequired,
    updatePlatform: React.PropTypes.func.isRequired
  }

  render() {
    if (!this.props.items) {
      return (
        <ul className='background-message text-center'>
          <li>
            <span className='loading loading-spinner-small inline-block'></span> Loading...
          </li>
        </ul>
      );
    }

    return (
      <div>
        <div className='native-key-bindings' tabIndex='-1'>
          <input type='search'
            autoFocus
            className='input-search'
            placeholder='Filter platforms by name'
            defaultValue={ this.props.filterValue }
            onChange={ (e) => this.props.setFilter(e.target.value) } />
        </div>
        { this.props.items && this.props.items.length === 0 &&
          <ul className='background-message text-center'>
            <li>
              No Results
            </li>
          </ul>
        }
        <br />
        { this.props.items.map(item => (
          <PlatformCard
            item={ item }
            actions={ this.props.actions }
            showPlatform={ this.props.showPlatform }
            showFramework={ this.props.showFramework }
            installPlatform={ this.props.installPlatform }
            uninstallPlatform={ this.props.uninstallPlatform }
            updatePlatform={ this.props.updatePlatform } />
        ))}
      </div>
    );
  }

}
