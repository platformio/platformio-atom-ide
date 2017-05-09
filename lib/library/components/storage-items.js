/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';

import { LibraryStorage } from '../storage';
import LibraryStorageItem from './storage-item';
import PropTypes from 'prop-types';
import React from 'react';


export default class LibraryStorageItems extends React.Component {

  static propTypes = {
    item: PropTypes.instanceOf(LibraryStorage).isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    uninstallLibrary: PropTypes.func.isRequired,
    updateLibrary: PropTypes.func.isRequired
  }

  static status = {
    LOADING: 1,
    NORESULTS: 2,
    LOADED: 3
  }

  getStatus() {
    if (this.props.item.items === undefined) {
      return LibraryStorageItems.status.LOADING;
    } else if (!this.props.item.items.length) {
      return LibraryStorageItems.status.NORESULTS;
    }
    return LibraryStorageItems.status.LOADED;
  }

  getStorageItems() {
    if (this.getStatus() !== LibraryStorageItems.status.LOADED) {
      return [];
    }
    return this.props.item.items;
  }

  onDidUninstallOrUpdateItem(event, item, cmd) {
    event.stopPropagation();
    const button = event.target;
    button.classList.add('btn-inprogress', 'disabled');
    (cmd === 'uninstall' ? this.props.uninstallLibrary : this.props.updateLibrary)(
      this.props.item.path,
      item.__pkg_dir,
      () => button.classList.remove('btn-inprogress', 'disabled')
    );
  }

  onDidReveal(event, dir) {
    event.stopPropagation();
    if (dir) {
      utils.revealFolder(dir);
    }
  }

  onDidToggleStorageList(event) {
    event.target.classList.toggle('icon-fold');
    event.target.classList.toggle('icon-unfold');
    this.refs.storageItems.classList.toggle('hide');
  }

  render() {
    const status = this.getStatus();
    const items = this.getStorageItems();

    let badge, toggle = null;
    if (status === LibraryStorageItems.status.LOADED && items.length) {
      badge = <span className='badge badge-medium'>{  items.length }</span>;
    }
    if (items.length) {
      toggle = (
        <span className='pull-right'>
          <a onClick={ (e) => this.onDidToggleStorageList(e) }><span className='icon icon-fold'></span></a>
        </span>
      );
    }

    return (
      <div>
        <h1 className='section-heading icon icon-file-submodule'><a onClick={ (e) => this.onDidReveal(e, this.props.item.path) }>{ this.props.item.name }</a> { badge } { toggle }</h1>
        { status === LibraryStorageItems.status.LOADING &&
          <p className='text-subtle'>
            <span className='loading loading-spinner-tiny inline-block'></span> Loading...
          </p> }
        { status === LibraryStorageItems.status.NORESULTS &&
          <p className='text-subtle'>
            No Results
          </p> }
        <div ref='storageItems'>
          { items.map(item => (
              <LibraryStorageItem item={ item }
                key={ item.name }
                onShow={ this.props.showLibrary }
                onReveal={ (e) => this.onDidReveal(e, item.__pkg_dir) }
                onUninstall={ (e) => this.onDidUninstallOrUpdateItem(e, item, 'uninstall') }
                onUpdate={ (e) => this.onDidUninstallOrUpdateItem(e, item, 'update') }
                onSearch={ this.props.searchLibrary }
                actions={ this.props.item.actions } />
            )) }
        </div>
      </div>
    );
  }
}
