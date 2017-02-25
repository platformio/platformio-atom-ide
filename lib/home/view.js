/** @babel */
/** @jsx etchDom */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import AboutPanel from './components/panel-about';
import { Emitter } from 'atom';
import { EtchComponent } from '../view';
import LibsPanel from '../libraries/panel';
import MenuView from './components/menu-view';
import { PanelsView } from './components/panels-view';
import WelcomePanel from './components/panel-welcome';
import { dom as etchDom } from 'etch';

export default class HomeView extends EtchComponent {

  static homebus = null;

  constructor(props) {
    super(props);

    this._selectedIndex = 0;
    this.getMenuItems().map((item, index) => {
      if (props.uri.startsWith(`platformio://home/${item.title.toLowerCase()}`)) {
        this._selectedIndex = index;
      }
    });
    // update menu and panels with new selected item
    this.refs.menu.update({
      selectedIndex: this._selectedIndex
    });
    this.refs.panels.update({
      selectedIndex: this._selectedIndex
    });
  }

  get homebus() {
    if (!HomeView.homebus) {
      HomeView.homebus = new Emitter();
    }
    return HomeView.homebus;
  }

  getMenuItems() {
    return [
      {
        icon: 'home',
        title: 'Welcome',
        component: (<WelcomePanel homebus={ this.homebus } />)
      },
      {
        icon: 'code',
        title: 'Libraries',
        component: (<LibsPanel homebus={ this.homebus } />)
      },
      {
        icon: 'info',
        title: 'About',
        component: (<AboutPanel homebus={ this.homebus } />)
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

  onDidMenuItemSelect(index) {
    this.refs.panels.update({
      selectedIndex: index
    });
  }

  destroy() {
    if (HomeView.homebus) {
      HomeView.homebus.dispose();
      HomeView.homebus = null;
    }
    super.destroy();
  }

  render() {
    return (
      <div className='pane-item home-view'>
        <MenuView ref='menu' items={ this.getMenuItems() } onselect={ (index) => this.onDidMenuItemSelect(index) } />
        <PanelsView ref='panels' items={ this.getMenuItems() } />
      </div>
    );
  }
}
