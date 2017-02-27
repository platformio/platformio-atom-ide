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

import { BaseView, jsxDOM } from '../../view';
import { CompositeDisposable, TextEditor } from 'atom';

import { LibStorageItem } from '../util';
import LibStorageView from './storage-view';
import fuzzaldrin from 'fuzzaldrin';


export default class LibStoragesView extends BaseView {

  constructor() {
    super(...arguments);

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
      return newStorage;
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
