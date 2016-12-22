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

import AboutPanel from './components/panel-about';
import EtchComponent from '../etch-component';
import MenuView from './components/menu-view';
import { PanelsView } from './components/panels-view';
import WelcomePanel from './components/panel-welcome';
import { dom as etchDom } from 'etch';

export default class HomeView extends EtchComponent {

  constructor(props) {
    super(props);

    this._selectedIndex = 0;
    this.getMenuItems().map((item, index) => {
      if (props.uri.startsWith(`platformio://home/${item.title.toLowerCase()}`)) {
        this._selectedIndex = index;
      }
    });
    // update menu and panels with new selected item
    this.refs.menu.update({selectedIndex: this._selectedIndex});
    this.refs.panels.update({selectedIndex: this._selectedIndex});
  }

  getMenuItems() {
    return [
      {
        icon: 'home',
        title: 'Welcome',
        component: (<WelcomePanel />)
      },
      {
        icon: 'info',
        title: 'About',
        component: (<AboutPanel />)
      }
    ];
  }

  getURI() {
    return this.props.uri;
  }

  getTitle() {
    return 'PlatformIO Home';
  }

  getIconName() {
    return 'home';
  }

  onDidMenuItemChange(index) {
    this.refs.panels.update({selectedIndex: index});
  }

  render() {
    return (
      <div className='pane-item home-view'>
        <MenuView ref='menu' items={this.getMenuItems()} onselect={(index) => this.onDidMenuItemChange(index)} />
        <PanelsView ref='panels' items={this.getMenuItems()} />
      </div>
    );
  }
}
