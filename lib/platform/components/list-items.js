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

import PlatformListItemView from './list-item-view';
import { TextEditor } from 'atom';
import fuzzaldrin from 'fuzzaldrin-plus';


export default class PlatformListItems extends FilteredList {

  get filterEditor() {
    return this.refs.filterEditor;
  }

  onDidFilter(query) {
    if (!this.props.items) {
      return;
    }
    this.refs.itemsView.update({
      items: query ? fuzzaldrin.filter(this.props.items, query, {
        key: 'name'
      }) : this.props.items
    });
  }

  onDidUninstallOrUpdateItem(event, item, cmd) {
    event.stopPropagation();
    event.target.classList.add('btn-inprogress', 'disabled');
    this.props.homebus.emit(
      'platform-' + cmd, [
        item.__pkg_dir,
        () => {
          event.target.classList.remove('btn-inprogress', 'disabled');
          this.props.items = this.props.items.filter(
            oldItem => oldItem.__pkg_dir !== item.__pkg_dir);
          this.update();
        }
      ]);
  }

  render() {
    return (
      <div>
        <TextEditor ref='filterEditor' mini={ true } placeholderText='Filter platforms by name' />
        { !this.props.items ? (
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul>
          ) : ('') }
        { this.props.items && this.props.items.length === 0 ? (
          <ul className='background-message text-center'>
            <li>
              No Results
            </li>
          </ul>
          ) : ('') }
        <br />
        <PlatformListItemsView ref='itemsView'
          homebus={ this.props.homebus }
          items={ this.props.items ? this.props.items : [] }
          actions={ this.props.actions }
          onuninstall={ (e, item) => this.onDidUninstallOrUpdateItem(e, item, 'uninstall') }
          onupdate={ (e, item) => this.onDidUninstallOrUpdateItem(e, item, 'update') } />
      </div>
    );
  }

}

class PlatformListItemsView extends BaseView {

  render() {
    return (
      <div>
        { this.props.items.map(item => (
            <PlatformListItemView homebus={ this.props.homebus }
              item={ item }
              actions={ this.props.actions }
              onuninstall={ e => this.props.onuninstall(e, item) }
              onupdate={ e => this.props.onupdate(e, item) } />
          )) }
      </div>
    );
  }

}
