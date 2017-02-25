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

import * as utils from '../utils';

import { BasePanel, EtchComponent } from '../view';

import { CompositeDisposable } from 'atom';
import LibBuiltInPanel from './components/panel-builtin';
import LibInstallStoragePrompt from './components/install-storage-prompt';
import LibInstalledPanel from './components/panel-installed';
import LibRegistrySearchPanel from './components/panel-registry-search';
import LibRegistryShowPanel from './components/panel-registry-show';
import LibRegistryStatsPanel from './components/panel-registry-stats';
import LibUpdatesPanel from './components/panel-updates';
import { dom as etchDom } from 'etch';
import { runLibraryCommand } from './util';

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
    this.subscriptions.add(this.props.homebus.on(
      'lib-update', ::this.onDidLibraryUpdate));
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
        id: 'builtin',
        submenu: 'built-in',
        icon: 'eye-watch',
        component: (
        <LibBuiltInPanel homebus={ this.props.homebus } />
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
    items.forEach(item => item.component.ref = `${item.id}Panel`);
    return items;
  }

  getSubmenu() {
    const candidates = new Map();
    let item = null;
    let active = false;
    this.getSubPanels().forEach(panel => {
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
    this.getSubPanels().forEach((item) => {
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

  onDidLibraryInstall([lib, callback]) {
    new LibInstallStoragePrompt().prompt().then(storage => {
      runLibraryCommand('install', storage, lib).then(
        result => {
          atom.notifications.addSuccess(
            'Library has been successfully installed', {
              detail: result
            }
          );
          callback(result);
        },
        error => callback(error)
      );
    }, (error) => {
      callback(error);
    });
  }

  onDidLibraryUninstall([storage, lib, callback]) {
    runLibraryCommand('uninstall', storage, lib).then(
      result => {
        atom.notifications.addSuccess(
          'Library has been successfully uninstalled', {
            detail: result
          }
        );
        callback(result);
      },
      error => callback(error)
    );
  }

  onDidLibraryUpdate([storage, lib, callback]) {
    runLibraryCommand('update', storage, lib).then(
      result => {
        atom.notifications.addSuccess(
          'Library has been successfully updated', {
            detail: result
          }
        );
        callback(result);
      },
      error => callback(error)
    );
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
