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

import { FilteredList, jsxDOM } from '../../view';

import { TextEditor } from 'atom';
import { expandFrameworksOrPlatforms } from '../util';
import fuzzaldrin from 'fuzzaldrin-plus';
import humanize from 'humanize';


export default class BoardsExplorerView extends FilteredList {

  constructor(props) {
    super(...arguments);
    if (props.items && props.items.length) {
      this.sanitizeItems(props.items).then(items => this.update({
        items
      }));
    }
  }

  async update(props) {
    if (props && props.items && props.items.length) {
      this.filterEditor.setText('');
      props.items = await this.sanitizeItems(props.items);
    }
    return super.update(...arguments);
  }

  async sanitizeItems(items) {
    if (items && items.length && items[0].__fuzzy) {
      return items;
    }
    for (const item of items) {
      item['__fuzzy'] = [
        item.name,
        item.platform,
        ...item.frameworks,
        item.mcu,
        item.id
      ].join('"');

      // make titled frameworks and platforms
      item.platform = (await expandFrameworksOrPlatforms('platforms', [item.platform]))[0];
      item.frameworks = await expandFrameworksOrPlatforms('frameworks', item.frameworks);
    }

    return items;
  }

  get filterEditor() {
    return this.refs.filterEditor;
  }

  onDidFilter() {
    this.update();
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
      key: '__fuzzy'
    }) : this.props.items;
  }

  onDidPlatformShow(name) {
    this.props.homebus.emit('panel-show', 'platforms');
    this.props.homebus.emit('platform-show', name);
  }

  onDidFrameworkShow(name) {
    this.props.homebus.emit('panel-show', 'platforms');
    this.props.homebus.emit('framework-show', name);
  }

  humanizeMemorySize(size) {
    return humanize.filesize(size, 1024, size % 1024 === 0 || size < 1024 ? 0 : 1).replace(' ', '');
  }

  render() {
    const items = this.getItems();
    return (
      <div>
        { this.props && this.props.title ? (
          <h2 className='section-heading icon icon-circuit-board'>{ this.props.title } <span className='badge badge-medium'>{ items && items.length ? items.length : '' }</span></h2>
          ) : (
          <h1 className='section-heading icon icon-circuit-board'>Board Explorer <span className='badge badge-medium'>{ items && items.length ? items.length : '' }</span></h1>
          ) }
        <div className='text'>
          <span className='icon icon-question'></span>You can use <span className='icon icon-clippy'></span> icon to copy Board ID to clipboard. Please read more how to <a href='http://docs.platformio.org/page/platforms/creating_board.html'>create a custom board</a>.
        </div>
        <br />
        <TextEditor ref='filterEditor' mini={ true } placeholderText='Search boards' />
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
        <table className='native-key-bindings table table-hover' tabIndex='-1' style={ { display: items && items.length ? 'block' : 'none' } }>
          <thead>
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
          </thead>
          <tbody>
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
                    <a onclick={ () => this.onDidPlatformShow(item.platform.name) }>
                      { item.platform.title }
                    </a>
                  </td>
                  <td className='inline-anchors'>
                    { item.frameworks.map(item => (
                        <a onclick={ () => this.onDidFrameworkShow(item.name) }>
                          { item.title }
                        </a>
                      )) }
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
          </tbody>
        </table>
      </div>
    );
  }

}
