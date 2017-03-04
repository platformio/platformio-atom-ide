/** @babel */
/** @jsx jsxDOM */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import { BaseView, FilteredList, jsxDOM } from '../../view';

import { LibStorageItem } from '../util';
import LibStorageView from './storage-view';
import { TextEditor } from 'atom';
import fuzzaldrin from 'fuzzaldrin-plus';


export default class LibStoragesView extends FilteredList {

  get filterEditor() {
    return this.refs.filterEditor;
  }

  onDidFilter(query) {
    if (!this.props.items) {
      return;
    }
    this.refs.storagesList.update({
      items: this.props.items.map(storage => {
        const newStorage = Object.assign(new LibStorageItem(storage.name), storage);
        if (newStorage.items) {
          newStorage.items = query ? fuzzaldrin.filter(
            newStorage.items, query, {
              key: 'name'
            }
          ) : newStorage.items;
        }
        return newStorage;
      })
    });
  }

  update(props) {
    const result = super.update(props);
    this.filterEditor.setText('');
    return result;
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

class LibStoragesListView extends BaseView {

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
