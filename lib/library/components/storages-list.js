/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { LibraryStorage } from '../storage';
import LibraryStorageItems from './storage-items';
import PropTypes from 'prop-types';
import React from 'react';


export default class LibraryStoragesList extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.instanceOf(LibraryStorage).isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    uninstallLibrary: PropTypes.func.isRequired,
    updateLibrary: PropTypes.func.isRequired
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
    if (!this.props.items.length) {
      return (
        <ul className='background-message text-center'>
          <li>
            No Results
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
          { this.props.items.map((item, index) => (
              <LibraryStorageItems item={ item }
                key={ index }
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
