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

import * as utils from '../utils';

import { BasePanel, EtchComponent } from '../etch-component';
import { installLibrary, uninstallLibrary } from './util';

import { CompositeDisposable } from 'atom';
import LibInstallPathPrompt from './components/install-path-prompt';
import LibInstalledPanel from './components/panel-installed';
import LibRegistrySearchPanel from './components/panel-registry-search';
import LibRegistryShowPanel from './components/panel-registry-show';
import LibRegistryStatsPanel from './components/panel-registry-stats';
import LibUpdatesPanel from './components/panel-updates';
import { dom as etchDom } from 'etch';

export default class LibrariesPanel extends BasePanel {

  constructor(props) {
    super(props);

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.props.homebus.on(
      'lib-show-panel', ::this.showLibrariesPanel));
    this.subscriptions.add(this.props.homebus.on(
      'lib-search', ::this.onDidLibrarySearch));
    this.subscriptions.add(this.props.homebus.on(
      'lib-show', ::this.onDidLibraryShow));
    this.subscriptions.add(this.props.homebus.on(
      'lib-install', ::this.onDidLibraryInstall));
    this.subscriptions.add(this.props.homebus.on(
      'lib-uninstall', ::this.onDidLibraryUninstall));
  }

  getSubPanels() {
    const items = [
      {
        id: 'stats',
        submenu: 'registry',
        icon: 'book',
        component: (
        <LibRegistryStatsPanel homebus={ this.props.homebus } />
        )
      },
      {
        id: 'search',
        submenu: 'registry',
        icon: 'book',
        component: (
        <LibRegistrySearchPanel homebus={ this.props.homebus } />
        )
      },
      {
        id: 'show',
        submenu: 'registry',
        icon: 'book',
        component: (
        <LibRegistryShowPanel homebus={ this.props.homebus } />
        )
      },
      {
        id: 'installed',
        submenu: 'installed',
        icon: 'package',
        component: (
        <LibInstalledPanel homebus={ this.props.homebus } />
        )
      },
      {
        id: 'updates',
        submenu: 'updates',
        icon: 'cloud-download',
        component: (
        <LibUpdatesPanel homebus={ this.props.homebus } />
        )
      }
    ];
    items.map(item => item.component.ref = `${item.id}Panel`);
    return items;
  }

  getSubmenu() {
    const candidates = new Map();
    let item = null;
    let active = false;
    this.getSubPanels().map(panel => {
      if (!this._panel_id && candidates.length === 0) {
        active = true;
      } else {
        active = this._panel_id && this._panel_id === panel.id;
      }
      if (!candidates.has(panel.submenu)) {
        item = {
          name: panel.submenu,
          icon: panel.icon,
          panelId: panel.id,
          active: active
        };
      } else {
        item = candidates.get(panel.submenu);
        item.active |= active;
      }
      candidates.set(panel.submenu, item);
    });
    const items = [];
    for (const item of candidates.values()) {
      items.push(item);
    }
    return items;
  }

  showLibrariesPanel(id) {
    this._panel_id = id;
    this.getSubPanels().map((item) => {
      if (item.id === id) {
        this.refs[`${item.id}Panel`].showPanel();
      } else {
        this.refs[`${item.id}Panel`].hidePanel();
      }
    });
    this.refs.libSubmenu.update({
      items: this.getSubmenu()
    });
  }

  onDidPanelShow() {
    // select initial LibrariesPanel
    if (!this._panel_id) {
      this.showLibrariesPanel(this.getSubPanels()[0].id);
    }
  }

  onDidLibrarySearch(options) {
    this.refs.searchPanel.update(options);
    this.showLibrariesPanel('search');
  }

  onDidLibraryShow(id) {
    this.refs.showPanel.update({
      id
    });
    this.showLibrariesPanel('show');
  }

  onDidLibraryInstall(lib) {
    new LibInstallPathPrompt(path => installLibrary(lib, path)).prompt();
  }

  onDidLibraryUninstall([lib, path, callback]) {
    uninstallLibrary(lib, path).then(result => callback(result));
  }

  destroy() {
    this.subscriptions.dispose();
    super.destroy();
  }

  render() {
    return (
      <div className='libraries-panel'>
        <LibrariesSubmenuView ref='libSubmenu' items={ [] } onpanelchanged={ (id) => this.showLibrariesPanel(id) } />
        { this.getSubPanels().map((item) => item.component) }
      </div>
    );
  }
}

class LibrariesSubmenuView extends EtchComponent {

  getClassListForItem(item) {
    const classList = ['btn', 'icon', `icon-${item.icon}`];
    if (item.active) {
      classList.push('selected');
    }
    return classList;
  }

  render() {
    return (
      <div ref='submenu' className='submenu btn-group btn-group-lg'>
        { this.props.items.map(item => (
            <button onclick={ () => this.props.onpanelchanged(item.panelId) } className={ this.getClassListForItem(item).join(' ') }>
              { utils.title(item.name) }
            </button>
          )) }
      </div>
    );
  }

}
