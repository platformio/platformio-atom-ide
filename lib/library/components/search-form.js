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


export default class LibrarySearchForm extends React.Component {

  static propTypes = {
    searchLibrary: PropTypes.func.isRequired,
    defaultSearch: PropTypes.string
  }

  componentWillReceiveProps(nextProps) {
    this.searchInput.value = nextProps.defaultSearch || '';
  }

  onDidSubmit(event) {
    event.preventDefault();
    this.props.searchLibrary(this.searchInput.value);
  }

  render() {
    return (
      <form onSubmit={ ::this.onDidSubmit } className='lib-search-from native-key-bindings' tabIndex='-1'>
        <input type='search'
          ref={ item => this.searchInput = item }
          className='input-search'
          placeholder='Search libraries'
          defaultValue={ this.props.defaultSearch }
          autoFocus />
        <div className='block search-tips'>
          <button type="button" onClick={ () => this.props.searchLibrary('tft display') } className='btn btn-default btn-xs icon icon-search' title='Search in "library.json" fields'>
            tft display
          </button>
          <button type="button" onClick={ () => this.props.searchLibrary('dht*') } className='btn btn-default btn-xs icon icon-search' title='Search for libraries that support DHT ICs (DHT11, DHT22)'>
            dht*
          </button>
          <button type="button" onClick={ () => this.props.searchLibrary('header:RH_ASK.h') } className='btn btn-default btn-xs icon icon-search' title='Search by header files (#inculde)'>
            header:RH_ASK.h
          </button>
          <button type="button" onClick={ () => this.props.searchLibrary('keyword:mqtt') } className='btn btn-default btn-xs icon icon-search' title='Filter libraries by keyword'>
            keyword:mqtt
          </button>
          <button type="button" onClick={ () => this.props.searchLibrary('framework:mbed') } className='btn btn-default btn-xs icon icon-search' title='ARM mbed based libraries'>
            framework:mbed
          </button>
          <button type="button" onClick={ () => this.props.searchLibrary('platform:espressif8266') } className='btn btn-default btn-xs icon icon-search' title='Search for Espressif 8266 compatible libraries'>
            platform:espressif8266
          </button>
          <a href='http://docs.platformio.org/page/userguide/lib/cmd_search.html'>more...</a>
        </div>
      </form>
    );
  }
}
