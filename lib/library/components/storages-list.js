/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { LibraryStorage } from '../storage';
import LibraryStorageItems from './storage-items';
import React from 'react';


export default class LibraryStoragesList extends React.Component {

  static propTypes = {
    items: React.PropTypes.arrayOf(
      React.PropTypes.instanceOf(LibraryStorage).isRequired
    ),
    filterValue: React.PropTypes.string.isRequired,
    setFilter: React.PropTypes.func.isRequired,
    searchLibrary: React.PropTypes.func.isRequired,
    showLibrary: React.PropTypes.func.isRequired,
    uninstallLibrary: React.PropTypes.func.isRequired,
    updateLibrary: React.PropTypes.func.isRequired
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
          <input
            type='search'
            autoFocus
            className='input-search'
            placeholder='Filter libraries by name'
            defaultValue={ this.props.filterValue }
            onChange={ (e) => this.props.setFilter(e.target.value) } />
        </div>
        <div className='lib-storages'>
          { this.props.items.map(item => (
              <LibraryStorageItems item={ item }
                searchLibrary={ this.props.searchLibrary }
                showLibrary={ this.props.showLibrary }
                uninstallLibrary={ this.props.uninstallLibrary }
                updateLibrary={ this.props.updateLibrary } />
            )) }
        </div>
      </div>
    );
  }

}
