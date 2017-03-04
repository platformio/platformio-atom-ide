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

import { BasePanel, FilteredList, jsxDOM } from '../../view';
import { expandFrameworksOrPlatforms, runPlatformCommand } from '../util';

import { TextEditor } from 'atom';
import fuzzaldrin from 'fuzzaldrin-plus';


export default class PlatformFrameworksPanel extends BasePanel {

  async onDidPanelShow() {
    if (this.isFrozenPanel()) {
      return;
    }
    const items = await runPlatformCommand('frameworks', {
      extraArgs: ['--json-output']
    });
    this.freezePanel();
    for (const item of items) {
      item.platforms = await expandFrameworksOrPlatforms('platforms', item.platforms);
    }
    this.refs.listItems.update({
      items
    });
  }

  render() {
    return (
      <div>
        <PlatformFrameworksList ref='listItems' homebus={ this.props.homebus } />
      </div>
    );
  }
}

class PlatformFrameworksList extends FilteredList {

  get filterEditor() {
    return this.refs.filterEditor;
  }

  onDidFilter() {
    this.update();
  }

  onDidShow(event, item) {
    event.stopPropagation();
    this.props.homebus.emit('framework-show', item);
  }

  onDidPlatform(event, name) {
    event.stopPropagation();
    this.props.homebus.emit('platform-show', name);
  }

  getItems() {
    if (!this.props.hasOwnProperty('items')) {
      return null;
    }
    if (!this.refs) {
      return this.props.items;
    }
    const query = this.filterEditor.getText();
    return query ? fuzzaldrin.filter(this.props.items, query, {
      key: 'name'
    }) : this.props.items;
  }

  render() {
    const items = this.getItems();
    return (
      <div>
        <TextEditor ref='filterEditor' mini={ true } placeholderText='Filter frameworks by name' />
        { !items ? (
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul>
          ) : ('') }
        { items && items.length === 0 ? (
          <ul className='background-message text-center'>
            <li>
              No Results
            </li>
          </ul>
          ) : ('') }
        <br />
        { (items ? items : []).map(item => this.renderItem(item)) }
      </div>
    );
  }

  renderItem(item) {
    return (
      <div onclick={ (e) => this.onDidShow(e, item) } className='native-key-bindings block list-item-card' tabIndex='-1'>
        <h2><a onclick={ (e) => this.onDidShow(e, item) }>{ item.title }</a></h2>
        <div className='block'>
          { item.description }
        </div>
        <div className='tag-buttons'>
          { (item.platforms ? item.platforms : []).map(item => (
              <button onclick={ (e) => this.onDidPlatform(e, item.name) } className='btn btn-sm icon icon-device-desktop inline-block-tight'>
                { item.title }
              </button>
            )) }
        </div>
      </div>
    );
  }

}
