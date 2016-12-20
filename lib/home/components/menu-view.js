/** @babel */
/** @jsx etch.dom */

/**
* Copyright (C) 2016 Ivan Kravets. All rights reserved.
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

/* eslint-disable no-unused-vars */
import EtchComponent from '../../etch-component';
import etch from 'etch';
/* eslint-enable no-unused-vars */

export default class MenuView extends EtchComponent {

  getSelectedIndex() {
    return 'selectedIndex' in this.props ? this.props.selectedIndex : 0;
  }

  handleItemClick(index) {
    this.update({
      selectedIndex: index
    });
    this.props.onchanged(index);
  }

  render() {
    return (
      <div className='menu'>
        <ul className='nav nav-pills nav-stacked'>
          {this.props.items.map((item, index) =>
          <MenuItemView
            item={item}
            selected={this.getSelectedIndex() === index}
            onclick={() => this.handleItemClick(index)} />
          )}
        </ul>
      </div>
      );
  }
}

// eslint-disable-next-line no-unused-vars
class MenuItemView extends EtchComponent {

  render() {
    return (
      <li className={this.props.selected ? 'selected' : ''} onclick={this.props.onclick}>
          <a className={'icon' in this.props.item? 'icon icon-' + this.props.item.icon : 'no-icon'}>{this.props.item.title}</a>
      </li>
      );
  }
}
