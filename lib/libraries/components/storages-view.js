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

import { CompositeDisposable, TextEditor } from 'atom';
import { EtchComponent } from '../../etch-component';
import { LibStorageItem } from '../util';
import LibStorageView from './storage-view.js';
import { dom as etchDom } from 'etch';
import fuzzaldrin from 'fuzzaldrin';

export default class LibStoragesView extends EtchComponent {

  constructor(props) {
    super(props);

    this.disposables = new CompositeDisposable();
    this.disposables.add(
      this.refs.filterEditor.onDidChange(::this.onFilterHandler));
    this.onFilterTimeoutId = null;
  }

  update(props) {
    super.update(props);
    if (this.refs.filterEditor.getText()) {
      this.refs.filterEditor.setText('');
    }
  }

  onFilterHandler() {
    if (this.onFilterTimeoutId) {
      clearTimeout(this.onFilterTimeoutId);
      this.onFilterTimeoutId = null;
    }
    if (!this.props.items) {
      return;
    }
    this.onFilterTimeoutId = setTimeout(
      () => this.refs.storagesList.update({
        items: this.filterStorageItems()
      }), 100);
  }

  filterStorageItems() {
    return this.props.items.map(storage => {
      const newStorage = Object.assign(new LibStorageItem(storage.name), storage);
      if (newStorage.items) {
        newStorage.items = fuzzaldrin.filter(
          newStorage.items, this.refs.filterEditor.getText(), {
            key: 'name'
          }
        );
      }
    });
  }

  destroy() {
    this.disposables.dispose();
    super.destroy();
  }

  render() {
    return (
      <div>
        <TextEditor ref='filterEditor' mini={ true } placeholderText='Filter libraries by name' />
        { this.props.items.length === 0 ? (
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul>
          ) : ('') }
        <LibStoragesListView ref='storagesList' homebus={ this.props.homebus } items={ this.props.items } />
      </div>
    );
  }

}

class LibStoragesListView extends EtchComponent {

  render() {
    return (
      <div className='lib-storages'>
        { this.props.items.map(item => (
            <LibStorageView homebus={ this.props.homebus } item={ item } />
          )) }
      </div>
    );
  }

}
