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
        this.refs.libInstalled.update({
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

  onDidUninstall(storage, itemIndex) {
    const item = storage.items[itemIndex];
    storage.items.splice(itemIndex, 1);
    this.props.homebus.emit(
      'lib-uninstall', [
        item.id ? item.id : item.name,
        storage.path,
        () => this.update()
      ]);
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

  render() {
    return (
      <div>
        { this.props.storages.map((storage, storageIndex) => (
            <div>
              <h1 className='section-heading icon icon-file-directory'>{ storage.name } <span className='badge badge-medium'>{ storage.items ? storage.items.length : '' }</span></h1>
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
              { this.getStorageItems(storageIndex).map((item, index) => (
                  <LibInstalledStorageItem homebus={ this.props.homebus } data={ item } onuninstall={ () => this.onDidUninstall(storage, index) } />
                )) }
            </div>
          )) }
      </div>
    );
  }
}

class LibInstalledStorageItem extends EtchComponent {

  onDidShow(event, id) {
    event.stopPropagation();
    if (id) {
      this.props.homebus.emit('lib-show', id);
    }
  }

  onDidUninstall(event) {
    event.stopPropagation();
    this.props.onuninstall();
  }

  onDidReveal(event) {
    event.stopPropagation();
    if (this.props.data.__pkg_dir) {
      utils.revealFolder(this.props.data.__pkg_dir);
    }
  }

  onDidKeywordSearch(event, name) {
    event.stopPropagation();
    this.props.homebus.emit('lib-search', {
      query: `keyword:"${name}"`
    });
  }

  getAuthorNames() {
    const items = [];
    if (this.props.data.authors) {
      this.props.data.authors.map(item => items.push(item.name));
    }
    return items;
  }

  render() {
    const authornames = this.getAuthorNames();
    return (
      <div onclick={ (e) => this.onDidShow(e, this.props.data.id) } className='block lib-summary-block' style={ { cursor: this.props.data.id ? 'pointer' : 'default' } }>
        <div className='row'>
          <div className='col-xs-9'>
            <h2><a onclick={ (e) => this.onDidShow(e, this.props.data.id) }>{ this.props.data.name }</a><small>{ authornames.length ? ` by ${authornames.join(', ')}` : '' }</small></h2>
          </div>
          <div className='col-xs-3 text-right text-nowrap'>
            <span className='icon icon-versions'></span>
            { this.props.data.version }
          </div>
        </div>
        <div className='block'>
          { this.props.data.description ? this.props.data.description : this.props.data.url }
        </div>
        <div className='row bottom-xs'>
          <div className='col-xs-7 lib-keywords'>
            { (this.props.data.keywords ? this.props.data.keywords : []).map(name => (
                <button onclick={ (e) => this.onDidKeywordSearch(e, name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { name }
                </button>
              )) }
          </div>
          <div className='col-xs-5 text-right lib-action'>
            <div className='btn-group'>
              <button onclick={ (e) => this.onDidReveal(e) } className='btn btn-primary icon icon-file-directory'>
                Reveal
              </button>
              <button onclick={ (e) => this.onDidUninstall(e) } className='btn btn-primary icon icon-trashcan'>
                Uninstall
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
