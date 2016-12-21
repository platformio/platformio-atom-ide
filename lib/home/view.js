/** @babel */
/** @jsx etchDom */

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

import AboutView from './components/about-view';
import EtchComponent from '../etch-component';
import MenuView from './components/menu-view';
import PanelsView from './components/panels-view';
import WelcomeView from './components/welcome-view';
import { dom as etchDom } from 'etch';

export default class HomeView extends EtchComponent {

  constructor(props) {
    props['menuItems'] = [
      {
        icon: 'home',
        title: 'Welcome',
        component: (<WelcomeView />)
      },
      {
        icon: 'info',
        title: 'About',
        component: (<AboutView />)
      },
    ];
    props['selectedMenuItemIndex'] = 0;

    props['menuItems'].map((item, index) => {
      if (props.uri.startsWith(`platformio://home/${item.title.toLowerCase()}`)) {
        props['selectedMenuItemIndex'] = index;
      }
    });

    super(props);
  }

  getInitialMenuItemIndex() {
    return 0;
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

  handleMenuItemChanged(index) {
    this.update({selectedMenuItemIndex: index});
  }

  render() {
    return (
      <div className='pane-item home-view'>
        <MenuView items={this.props.menuItems} selectedIndex={this.props.selectedMenuItemIndex} onchanged={(index) => this.handleMenuItemChanged(index)} />
        <PanelsView items={this.props.menuItems} selectedIndex={this.props.selectedMenuItemIndex} />
      </div>
    );
  }
}
