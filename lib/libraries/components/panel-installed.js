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

import { BasePanel, EtchComponent } from '../../etch-component';
import { CompositeDisposable, TextEditor } from 'atom';
import LibInstalledItemView from './installed-item-view.js';
import { dom as etchDom } from 'etch';
import fuzzaldrin from 'fuzzaldrin';
import { getPioProjects } from '../../project/util';
import { loadInstalledLibraries } from '../util';
import path from 'path';

export default class LibInstalledPanel extends BasePanel {

  constructor(props) {
    super(props);

    this.disposables = new CompositeDisposable();
    this.disposables.add(
      this.refs.filterEditor.onDidChange(::this.onFilterHandler));
    this.onFilterTimeoutId = null;
    this._storageItems = new Map();
  }

  onFilterHandler() {
    if (this.onFilterTimeoutId) {
      clearTimeout(this.onFilterTimeoutId);
      this.onFilterTimeoutId = null;
    }
    this.onFilterTimeoutId = setTimeout(
      () => this.refs.libInstalled.update({
        storageItems: this.filterStorageItems()
      }), 100);
  }

  onDidPanelShow() {
    // reset previous view
    this._storageItems.clear();
    this.refs.libInstalled.update({
      storages: this.getLibStorages(),
      storageItems: this._storageItems
    });

    this.getLibStorages().map((storage, index) => {
      loadInstalledLibraries(storage.path).then(items => {
        this._storageItems.set(index, items);
        const storages = this.getLibStorages();
        // update real storage path
        if (!storages[index].path && items) {
          storages[index].path = path.dirname(items[0].__pkg_dir);
        }
        this.refs.libInstalled.update({
          storages: storages,
          storageItems: this._storageItems
        });
      });
    });
  }

  getLibStorages() {
    const items = [];
    getPioProjects().map(p => {
      items.push({
        name: `Project: ${path.basename(p)}`,
        path: p
      });
    });
    items.push({
      name: 'Global Storage',
      path: ''
    });
    return items;
  }

  filterStorageItems() {
    const items = new Map();
    for (const [storageIndex, storageItems] of this._storageItems.entries()) {
      items.set(storageIndex, fuzzaldrin.filter(
        storageItems,
        this.refs.filterEditor.getText(),
        {
          key: 'name'
        }
      ));
    }
    return items;
  }

  destroy() {
    this.disposables.dispose();
    super.destroy();
  }

  render() {
    return (
      <div className='lib-installed'>
        <TextEditor ref='filterEditor' mini={ true } placeholderText='Filter libraries by name' />
        <LibInstalledView ref='libInstalled' homebus={ this.props.homebus } storages={ this.getLibStorages() } />
      </div>
    );
  }
}

class LibInstalledView extends EtchComponent {

  static status = {
    LOADING: 1,
    NORESULTS: 2,
    LOADED: 3
  }

  getStatus(storageIndex) {
    if (!this.props.hasOwnProperty('storageItems') || !this.props.storageItems.has(storageIndex)) {
      return LibInstalledView.status.LOADING;
    } else if (!this.props.storageItems.get(storageIndex).length) {
      return LibInstalledView.status.NORESULTS;
    }
    return LibInstalledView.status.LOADED;
  }

  getStorageItems(storageIndex) {
    if (this.getStatus(storageIndex) !== LibInstalledView.status.LOADED) {
      return [];
    }
    return this.props.storageItems.get(storageIndex);
  }

  onDidUninstall(storageIndex, itemIndex) {
    const storage = this.props.storages[storageIndex];
    const items = this.getStorageItems(storageIndex);
    const item = items[itemIndex];
    items.splice(itemIndex, 1);
    this.props.storageItems.set(storageIndex, items);
    this.props.homebus.emit(
      'lib-uninstall', [
        item.id ? item.id : item.name,
        storage.path,
        () => this.update()
      ]);
  }

  onDidRevealStorage(dir) {
    if (dir) {
      utils.revealFolder(dir);
    }
  }

  onDidToggleStorageList(event, storageIndex) {
    event.target.classList.toggle('icon-fold');
    event.target.classList.toggle('icon-unfold');
    this.refs['storageList-' + storageIndex].classList.toggle('hide');
  }

  render() {
    return (
      <div>
        { this.props.storages.map((storage, storageIndex) => (
            <div>
              <h1 className='section-heading icon icon-file-directory'>
                <a onclick={ () => this.onDidRevealStorage(storage.path) }>{ storage.name }</a>
                &nbsp;<span className='badge badge-medium'>{ this.getStatus(storageIndex) === LibInstalledView.status.LOADED ? this.getStorageItems(storageIndex).length : '' }</span>
                <span className='pull-right'><a onclick={ (e) => this.onDidToggleStorageList(e, storageIndex) }><span className='icon icon-fold'></span></a></span>
              </h1>
              { this.getStatus(storageIndex) === LibInstalledView.status.LOADING ? (
                <p className='text-subtle'>
                  <span className='loading loading-spinner-tiny inline-block'></span> Loading...
                </p>
                ) : ('') }
              { this.getStatus(storageIndex) === LibInstalledView.status.NORESULTS ? (
                <p className='text-subtle'>
                  No Results
                </p>
                ) : ('') }
              <div ref={ 'storageList-' + storageIndex }>
                { this.getStorageItems(storageIndex).map((item, index) => (
                    <LibInstalledItemView homebus={ this.props.homebus } data={ item } onuninstall={ () => this.onDidUninstall(storageIndex, index) } />
                  )) }
              </div>
            </div>
          )) }
      </div>
    );
  }
}
