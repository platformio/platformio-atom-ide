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

import { PanelSubmenuView, SubPanels, jsxDOM } from '../view';

import { CompositeDisposable } from 'atom';
import LibBuiltInPanel from './components/panel-builtin';
import LibInstallStoragePrompt from './components/install-storage-prompt';
import LibInstalledPanel from './components/panel-installed';
import LibLibraryPanel from './components/panel-library';
import LibRegistrySearchPanel from './components/panel-registry-search';
import LibRegistryStatsPanel from './components/panel-registry-stats';
import LibUpdatesPanel from './components/panel-updates';
import { runLibraryCommand } from './util';


export default class LibrariesPanel extends SubPanels {

  constructor() {
    super(...arguments);
    this.subscriptions = new CompositeDisposable();
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
        id: 'library',
        icon: 'book',
        component: (
        <LibLibraryPanel homebus={ this.props.homebus } />
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

  showSubPanel(id) {
    super.showSubPanel(id);
    // don't change submenu when show a library
    if (id === 'library') {
      return;
    }
    this.refs.panelSubmenu.update({
      items: this.getSubmenu()
    });
  }

  onDidPanelShow() {
    // select initial LibrariesPanel
    if (!this.lastSubpanelId) {
      this.showSubPanel(this.getSubPanels()[0].id);
    }
  }

  onDidLibrarySearch(options) {
    this.refs.searchPanel.update(options);
    this.showSubPanel('search');
  }

  onDidLibraryShow(data) {
    this.refs.libraryPanel.update({
      data
    });
    this.showSubPanel('library');
  }

  onDidLibraryInstall([lib, callback]) {
    new LibInstallStoragePrompt().prompt().then(storage => {
      runLibraryCommand('install', {
        storage,
        extraArgs: [lib]
      }).then(
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
    runLibraryCommand('uninstall', {
      storage,
      extraArgs: [lib]
    }).then(
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
    runLibraryCommand('update', {
      storage,
      extraArgs: [lib]
    }).then(
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
    return super.destroy();
  }

  render() {
    return (
      <div className='libraries-panel'>
        <PanelSubmenuView ref='panelSubmenu' onpanelchanged={ (id) => this.showSubPanel(id) } />
        { this.getSubPanels().map((item) => item.component) }
      </div>
    );
  }
}
