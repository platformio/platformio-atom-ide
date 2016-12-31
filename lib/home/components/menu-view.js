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

import { EtchComponent } from '../../etch-component';
import { dom as etchDom } from 'etch';

export default class MenuView extends EtchComponent {

  getSelectedIndex() {
    return this.props.hasOwnProperty('selectedIndex') ? this.props.selectedIndex : 0;
  }

  onDidSelect(index) {
    if (this.props.selectedIndex !== index) {
      this.update({
        selectedIndex: index
      });
    }
    this.props.onselect(index);
  }

  render() {
    return (
      <div className='menu'>
        <ul className='nav nav-pills nav-stacked'>
          { this.props.items.map((item, index) => (
              <MenuItem item={ item } selected={ this.getSelectedIndex() === index } onselect={ () => this.onDidSelect(index) } />
            )) }
        </ul>
      </div>
    );
  }
}

class MenuItem extends EtchComponent {

  render() {
    return (
      <li className={ this.props.selected ? 'selected' : '' } onclick={ this.props.onselect }>
        <a className={ this.props.item.hasOwnProperty('icon') ? 'icon icon-' + this.props.item.icon : 'no-icon' }>
          { this.props.item.title }
        </a>
      </li>
    );
  }

}
