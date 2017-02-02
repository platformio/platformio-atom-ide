/** @babel */
/** @jsx etchDom */

/**
 * Copyright 2016-present Ivan Kravets <me@ikravets.com>
 *
 * This source file is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import * as utils from '../../utils';

import { EtchComponent } from '../../etch-component';
import LibItemCardView from './item-card-view.js';
import { dom as etchDom } from 'etch';

export default class LibStorageView extends EtchComponent {

  static status = {
    LOADING: 1,
    NORESULTS: 2,
    LOADED: 3
  }

  getStatus() {
    if (this.props.item.items === undefined) {
      return LibStorageView.status.LOADING;
    } else if (!this.props.item.items.length) {
      return LibStorageView.status.NORESULTS;
    }
    return LibStorageView.status.LOADED;
  }

  getStorageItems() {
    if (this.getStatus() !== LibStorageView.status.LOADED) {
      return [];
    }
    return this.props.item.items;
  }

  onDidUninstallOrUpdateItem(event, item, cmd) {
    event.stopPropagation();
    event.target.classList.add('btn-inprogress', 'disabled');

    let lib = item.id ? item.id : item.name;
    if (cmd === 'uninstall') {
      lib += `@${item.version}`;
    }
    this.props.homebus.emit(
      'lib-' + cmd, [
        this.props.item.path,
        lib,
        () => {
          event.target.classList.remove('btn-inprogress', 'disabled');
          this.props.item.items = this.getStorageItems().filter(
            oldItem => oldItem.__pkg_dir !== item.__pkg_dir);
          this.update();
        }
      ]);
  }

  onDidReveal(dir) {
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
    if (!this.props.item) {
      return (<span></span>);
    }
    return (
      <div>
        <h1 className='section-heading icon icon-file-submodule'><a onclick={ () => this.onDidReveal(this.props.item.path) }>{ this.props.item.name }</a> <span className='badge badge-medium'>{ this.getStatus() === LibStorageView.status.LOADED ? this.getStorageItems().length : '' }</span> <span className='pull-right'><a onclick={ (e) => this.onDidToggleStorageList(e) }><span className='icon icon-fold'></span></a></span></h1>
        { this.getStatus() === LibStorageView.status.LOADING ? (
          <p className='text-subtle'>
            <span className='loading loading-spinner-tiny inline-block'></span> Loading...
          </p>
          ) : ('') }
        { this.getStatus() === LibStorageView.status.NORESULTS ? (
          <p className='text-subtle'>
            No Results
          </p>
          ) : ('') }
        <div ref='storageItems'>
          { this.getStorageItems().map(item => (
              <LibItemCardView homebus={ this.props.homebus }
                item={ item }
                onreveal={ () => this.onDidReveal(item.__pkg_dir) }
                onuninstall={ (e) => this.onDidUninstallOrUpdateItem(e, item, 'uninstall') }
                onupdate={ (e) => this.onDidUninstallOrUpdateItem(e, item, 'update') }
                actions={ this.props.item.actions } />
            )) }
        </div>
      </div>
    );
  }
}
