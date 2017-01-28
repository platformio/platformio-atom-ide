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
import { loadBuiltInLibraries } from '../util';

export default class LibBuiltInPanel extends BasePanel {

  constructor(props) {
    super(props);

    this.disposables = new CompositeDisposable();
    this.disposables.add(
      this.refs.filterEditor.onDidChange(::this.onFilterHandler));
    this.onFilterTimeoutId = null;
    this._items = null;
  }

  onFilterHandler() {
    if (this.onFilterTimeoutId) {
      clearTimeout(this.onFilterTimeoutId);
      this.onFilterTimeoutId = null;
    }
    this.onFilterTimeoutId = setTimeout(
      () => this.refs.libBuiltIn.update({
        items: this.filterItems()
      }), 100);
  }

  onDidPanelShow() {
    if (this._items) {
      return;
    }
    loadBuiltInLibraries().then(items => {
      this._items = items;
      this.refs.libBuiltIn.update({
        items
      });
    });

  }

  filterItems() {
    const items = [];
    if (!this._items) {
      return items;
    }
    this._items.map(storage => {
      items.push({
        name: storage.name,
        path: storage.path,
        items: fuzzaldrin.filter(
          storage.items,
          this.refs.filterEditor.getText(),
          {
            key: 'name'
          }
        )
      });
    });
    return items;
  }

  destroy() {
    this.disposables.dispose();
    super.destroy();
  }

  render() {
    return (
      <div className='lib-builtin'>
        <TextEditor ref='filterEditor' mini={ true } placeholderText='Filter libraries by name' />
        <LibBuiltInView ref='libBuiltIn' homebus={ this.props.homebus } />
      </div>
    );
  }
}

class LibBuiltInView extends EtchComponent {

  static status = {
    LOADING: 1,
    NORESULTS: 2,
    LOADED: 3
  }

  getStatus() {
    if (!this.props.hasOwnProperty('items')) {
      return LibBuiltInView.status.LOADING;
    } else if (!this.props.items.length) {
      return LibBuiltInView.status.NORESULTS;
    }
    return LibBuiltInView.status.LOADED;
  }

  onDidReveal(dir) {
    utils.revealFolder(dir);
  }

  toggleStorageList(event, storagePath) {
    event.target.classList.toggle('icon-fold');
    event.target.classList.toggle('icon-unfold');
    this.refs[storagePath].classList.toggle('hide');
  }

  render() {
    return (
      <div>
        { this.getStatus() === LibBuiltInView.status.LOADING ? (
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul>
          ) : ('') }
        { this.getStatus() === LibBuiltInView.status.NORESULTS ? (
          <ul className='background-message text-center'>
            <li>
              No Results
            </li>
          </ul>
          ) : ('') }
        { (this.props.items ? this.props.items : []).map(storage => (
            <div>
              <h1 className='section-heading icon icon-file-directory'>
                <a onclick={ () => this.onDidReveal(storage.path) }>{ storage.name }</a>
                &nbsp;<span className='badge badge-medium'>{ storage.items.length }</span>
                <span className='pull-right'><a onclick={ (e) => this.toggleStorageList(e, storage.path) }><span className='icon icon-fold'></span></a></span>
              </h1>
              { !storage.items.length ? (
                <p className='text-subtle'>
                  No Results
                </p>
                ) : ('') }
              <div ref={ storage.path }>
                { storage.items.map(item => (
                    <LibInstalledItemView homebus={ this.props.homebus } data={ item } />
                  )) }
              </div>
            </div>
          )) }
      </div>
    );
  }
}
