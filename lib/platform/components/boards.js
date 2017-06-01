/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { INPUT_FILTER_DELAY } from '../../config';
import PropTypes from 'prop-types';
import React from 'react';
import Reactable from 'reactable';
import humanize from 'humanize';


export default class Boards extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      vendor: PropTypes.string.isRequired,
      platform: PropTypes.shape({
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
      }).isRequired,
      frameworks: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
      })).isRequired,
      mcu: PropTypes.string.isRequired,
      fcpu: PropTypes.number.isRequired,
      rom: PropTypes.number.isRequired,
      ram: PropTypes.number.isRequired
    })),
    header: PropTypes.string,
    headerSize: PropTypes.number,
    itemsPerPage: PropTypes.number,
    defaultFilter: PropTypes.string,
    onFilter: PropTypes.func,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired
  }

  static defaultProps ={
    defaultFilter: '',
    itemsPerPage: 15,
    headerSize: 1
  }

  constructor() {
    super(...arguments);
    this.setState({
      filterValue: this.props.defaultFilter || ''
    });
    this._filterTimer = null;
  }

  humanizeMemorySize(size) {
    return humanize.filesize(size, 1024, size % 1024 === 0 || size < 1024 ? 0 : 1);
  }

  humanizeDebug(data) {
    if (!data || !data.tools) {
      return;
    }
    const tools = [];
    Object.keys(data.tools).forEach(key => {
      const options = data.tools[key];
      const attrs = [];
      if (options.default) {
        attrs.push('default');
      }
      if (options.onboard) {
        attrs.push('on-board');
      }
      if (attrs.length) {
        tools.push(`${key} (${attrs.join(', ')})`);
      } else {
        tools.push(key);
      }
    });
    return tools.join(', ');
  }

  onFilter(value) {
    if (this._filterTimer) {
      clearInterval(this._filterTimer);
    }
    this._filterTimer = setTimeout(() => {
      if (this.props.onFilter) {
        this.props.onFilter(value);
      }
      this.setState({
        filterValue: value
      });
    }, INPUT_FILTER_DELAY);
  }

  render() {
    const items = this.props.items;
    let badge = null;
    if (items && items.length) {
      badge = <span className='badge badge-medium'>{ items.length || '' }</span>;
    }

    return (
      <div>
        { this.props.headerSize === 1 ? (
          <h1 className='section-heading icon icon-circuit-board'>{ this.props.header } { badge }</h1>
          ) : (
          <h2 className='section-heading icon icon-circuit-board'>{ this.props.header } { badge }</h2>
          ) }
        <div className='text'>
          <span className='icon icon-question'></span>You can use <span className='icon icon-clippy'></span> icon to copy Board ID to clipboard. Please read more how to <a href='http://docs.platformio.org/page/platforms/creating_board.html'>create a custom board</a>. When the table columns can not fit on screen, please scroll horizontally.
        </div>
        <div className='text'>
          <span className='icon icon-bug'></span><a href='http://docs.platformio.org/page/plus/debugging.html'>PIO Unified Debugger</a>: mouse over the icon to list available debugging tools or check which are already on a board.
        </div>
        <br />
        <div className='native-key-bindings' tabIndex='-1'>
          <input type='search'
            autoFocus
            className='input-search'
            placeholder='Filter boards, sort by columns...'
            defaultValue={ this.props.defaultFilter }
            onChange={ (e) => this.onFilter(e.target.value) } />
        </div>
        { !items &&
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul> }
        { items && items.length === 0 &&
          <ul className='background-message text-center'>
            <li>
              No Results
            </li>
          </ul> }
        {items && items.length && this.renderTable(items)}
      </div>
    );
  }

  renderTable(items) {
    const Table = Reactable.Table,
      Thead = Reactable.Thead,
      Th = Reactable.Th,
      Tr = Reactable.Tr,
      Td = Reactable.Td;
    const filterFields = ['id', 'name', 'platform', 'frameworks', 'mcu', 'vendor'];
    const filterValue = this.state && this.state.filterValue ? this.state.filterValue : (this.props.defaultFilter || '');
    const itemsPerPage = this.props.itemsPerPage > items.length ? false : this.props.itemsPerPage;

    return (
      <div>
        <Table
          itemsPerPage={ itemsPerPage }
          filterable={ filterFields }
          filterBy={ filterValue }
          sortable
          hideFilterInput
          className='native-key-bindings table table-hover reacttable'
          tabIndex='-1'>
          <Thead>
            <Th column='name'>
              Name
            </Th>
            <Th column='platform'>
              Platform
            </Th>
            <Th column='frameworks'>
              Frameworks
            </Th>
            <Th column='debug'>
              Debug
            </Th>
            <Th column='mcu'>
              MCU
            </Th>
            <Th column='fcpu'>
              FRQ
            </Th>
            <Th column='rom'>
              ROM
            </Th>
            <Th column='ram'>
              RAM
            </Th>
          </Thead>
          { items.map(item => (
              <Tr key={ item.name }>
                <Td column='name' value={ item.name }>
                  <span>
                    <a onClick={ () => atom.clipboard.write(item.id) } title={ `Copy to clipboard: ${item.id}` }><span className='icon icon-clippy'></span></a>
                    <a href={ item.url }>
                      { item.name }
                    </a>
                  </span>
                </Td>
                <Td column='platform' value={ item.platform.name }>
                  <a onClick={ () => this.props.showPlatform(item.platform.name) }>
                    { item.platform.title }
                  </a>
                </Td>
                <Td column='frameworks' value={ item.frameworks.map(f => f.name).join() } className='inline-anchors'>
                  <span>{ item.frameworks.map(framework => (
                            <a onClick={ () => this.props.showFramework(framework.name) } key={ framework.title }>
                              { framework.title }
                            </a>
                          )) }</span>
                </Td>
                <Td column='debug' value={ item.debug ? -1 : 1 }>
                  <span>{ item.debug && <a href='http://docs.platformio.org/page/plus/debugging.html'><span className='icon icon-bug' title={ this.humanizeDebug(item.debug) }></span></a> }</span>
                </Td>
                <Td column='mcu' data={ item.mcu }></Td>
                <Td column='fcpu' value={ item.fcpu } className='text-nowrap'>
                  <span>{ Math.round(item.fcpu / 1000000) } Mhz</span>
                </Td>
                <Td column='rom' value={ item.rom } className='text-nowrap'>
                  { this.humanizeMemorySize(item.rom) }
                </Td>
                <Td column='ram' value={ item.ram } className='text-nowrap'>
                  { this.humanizeMemorySize(item.ram) }
                </Td>
              </Tr>
            )) }
        </Table>
      </div>
    );
  }

}
