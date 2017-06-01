/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';


export default class FrameworksList extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired
  }

  onDidShow(event, name) {
    event.stopPropagation();
    this.props.showFramework(name);
  }

  onDidPlatform(event, name) {
    event.stopPropagation();
    this.props.showPlatform(name);
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
            placeholder='Filter frameworks by name'
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
        { this.props.items.map(item => this.renderItem(item))}
      </div>
    );
  }

  renderItem(item) {
    return (
      <div onClick={ (e) => this.onDidShow(e, item.name) } className='native-key-bindings block list-item-card' tabIndex='-1'>
        <h2><a onClick={ (e) => this.onDidShow(e, item.name) }>{ item.title }</a></h2>
        <div className='block'>
          { item.description }
        </div>
        <div className='inline-buttons'>
          { (item.platforms || []).map(item => (
              <button onClick={ (e) => this.onDidPlatform(e, item.name) } className='btn btn-sm icon icon-device-desktop inline-block-tight'>
                { item.title }
              </button>
            )) }
        </div>
      </div>
    );
  }

}
