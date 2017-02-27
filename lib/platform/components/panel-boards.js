/** @babel */
/** @jsx etch.dom */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as utils from '../../utils';

import { BasePanel, EtchComponent } from '../../view';
import { CompositeDisposable, TextEditor } from 'atom';
import { getAllFrameworks, getAllPlatforms, getBoards } from '../util';

import etch from 'etch';
import fuzzaldrin from 'fuzzaldrin';
import humanize from 'humanize';

export default class BoardsExplorerPanel extends BasePanel {

  async onDidPanelShow() {
    if (this.isFrozenPanel()) {
      return;
    }

    let items = (await getBoards()).map(item => {
      const newItem = Object.assign({}, item);
      newItem['__fuzzy'] = [
        item.name,
        item.platform,
        ...item.frameworks,
        item.mcu,
        item.id
      ].join('"');
      return newItem;
    });
    this.freezePanel();

    // make titled frameworks and platforms
    try {
      const [platforms, frameworks] = await Promise.all(
        [getAllPlatforms(), getAllFrameworks()]
      );
      items = items.map(item => {
        platforms.forEach(p => {
          if (p.name === item.platform) {
            item.platform = {
              name: p.name,
              title: p.title
            };
          }
        });
        item.frameworks = item.frameworks.map(name => {
          for (const f of frameworks) {
            if (f.name === name) {
              return {
                name: f.name,
                title: f.title
              };
            }
          }
          return name;
        });
        return item;
      });
    } catch (err) {
      console.error('Could not fetch platforms/frameworks data', err);
    }

    this.refs.boardsExplorer.update({
      items
    });
  }

  render() {
    return (
      <div>
        <BoardsExplorerView ref='boardsExplorer' />
      </div>
    );
  }

}

class BoardsExplorerView extends EtchComponent {

  constructor() {
    super(...arguments);
    this.disposables = new CompositeDisposable();
    this.disposables.add(
      this.refs.filterEditor.onDidChange(::this.onFilterHandler));
    this.onFilterTimeoutId = null;
  }

  onFilterHandler() {
    if (this.onFilterTimeoutId) {
      clearTimeout(this.onFilterTimeoutId);
      this.onFilterTimeoutId = null;
    }
    this.onFilterTimeoutId = setTimeout(() => this.update(), 100);
  }

  getItems() {
    if (!this.props.hasOwnProperty('items')) {
      return null;
    }
    if (!this.refs) {
      return this.props.items;
    }
    return fuzzaldrin.filter(this.props.items, this.refs.filterEditor.getText(), {
      key: '__fuzzy'
    });
  }

  humanizeMemorySize(size) {
    return humanize.filesize(size, 1024, size % 1024 === 0 || size < 1024 ? 0 : 1).replace(' ', '');
  }

  render() {
    const items = this.getItems();
    return (
      <div>
        <h1 className='section-heading icon icon-circuit-board'>Board Explorer <span className='badge badge-medium'>{ items && items.length ? items.length : '' }</span></h1>
        <div className='text native-key-bindings' tabIndex='-1'>
          <span className='icon icon-question'></span>You can use <span className='icon icon-clippy'></span> icon to copy Board ID to clipboard
        </div>
        <br />
        <TextEditor ref='filterEditor' mini={ true } placeholderText='Search boards' />
        <ul className='background-message text-center' style={ { display: !items ? 'block' : 'none' } }>
          <li>
            <span className='loading loading-spinner-small inline-block'></span> Loading...
          </li>
        </ul>
        <ul className='background-message text-center' style={ { display: items && items.length === 0 ? 'block' : 'none' } }>
          <li>
            No Results
          </li>
        </ul>
        <table className='native-key-bindings table table-hover' tabIndex='-1' style={ { display: items && items.length ? 'block' : 'none' } }>
          <tr>
            <th>
              ID
            </th>
            <th>
              Name
            </th>
            <th>
              Platform
            </th>
            <th>
              Frameworks
            </th>
            <th>
              MCU
            </th>
            <th>
              FRQ / ROM / RAM
            </th>
          </tr>
          { (items ? items : []).map(item => (
              <tr>
                <td>
                  <a onclick={ () => atom.clipboard.write(item.id) }><span title='Copy to clipboard' className='icon icon-clippy'></span></a> <span className='inline-block highlight'>{ item.id }</span>
                </td>
                <td>
                  <a href={ item.url }>
                    { item.name }
                  </a>
                </td>
                <td>
                  { item.platform.title ? item.platform.title : utils.title(item.platform) }
                </td>
                <td>
                  { item.frameworks.map(item => item.title ? item.title : utils.title(item)).join(', ') }
                </td>
                <td>
                  { item.mcu }
                </td>
                <td className='text-nowrap'>
                  <span>{ Math.round(item.fcpu / 1000000) }Mhz</span>
                  <span>{ ' / ' + this.humanizeMemorySize(item.rom) }</span>
                  <span>{ ' / ' + this.humanizeMemorySize(item.ram) }</span>
                </td>
              </tr>
            )) }
        </table>
      </div>
    );
  }

  destroy() {
    this.disposables.dispose();
    super.destroy();
  }
}
