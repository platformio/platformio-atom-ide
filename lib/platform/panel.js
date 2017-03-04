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
import FrameworkDetailPanel from './components/panel-framework-detail';
import PlatformDesktopPanel from './components/panel-desktop';
import PlatformDetailPanel from './components/panel-platform-detail';
import PlatformEmbeddedPanel from './components/panel-embedded';
import PlatformFrameworksPanel from './components/panel-frameworks';
import PlatformInstalledPanel from './components/panel-installed';
import PlatformUpdatesPanel from './components/panel-updates';
import { runPlatformCommand } from './util';


export default class PlatformPanel extends SubPanels {

  constructor() {
    super(...arguments);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.props.homebus.on(
      'platform-show', ::this.onDidPlatformShow));
    this.subscriptions.add(this.props.homebus.on(
      'framework-show', ::this.onDidFrameworkShow));
    this.subscriptions.add(this.props.homebus.on(
      'platform-install', ::this.onDidPlatformInstall));
    this.subscriptions.add(this.props.homebus.on(
      'platform-uninstall', ::this.onDidPlatformUninstall));
    this.subscriptions.add(this.props.homebus.on(
      'platform-update', ::this.onDidPlatformUpdate));
  }

  getSubPanels() {
    const items = [
      {
        id: 'embedded',
        submenu: 'embedded',
        icon: 'circuit-board',
        component: (
        <PlatformEmbeddedPanel homebus={ this.props.homebus } />
        )
      },
      {
        id: 'desktop',
        submenu: 'desktop',
        icon: 'device-desktop',
        component: (
        <PlatformDesktopPanel homebus={ this.props.homebus } />
        )
      },
      {
        id: 'frameworks',
        submenu: 'frameworks',
        icon: 'gear',
        component: (
        <PlatformFrameworksPanel homebus={ this.props.homebus } />
        )
      },
      {
        id: 'installed',
        submenu: 'installed',
        icon: 'package',
        component: (
        <PlatformInstalledPanel homebus={ this.props.homebus } />
        )
      },
      {
        id: 'updates',
        submenu: 'updates',
        icon: 'cloud-download',
        component: (
        <PlatformUpdatesPanel homebus={ this.props.homebus } />
        )
      },
      {
        id: 'platformDetail',
        submenu: 'embedded',
        icon: 'book',
        component: (
        <PlatformDetailPanel homebus={ this.props.homebus } />
        )
      },
      {
        id: 'frameworkDetail',
        submenu: 'frameworks',
        icon: 'book',
        component: (
        <FrameworkDetailPanel homebus={ this.props.homebus } />
        )
      }
    ];
    items.forEach(item => item.component.ref = `${item.id}Panel`);
    return items;
  }

  showSubPanel(id) {
    const _lastId = this.lastSubpanelId;
    super.showSubPanel(id);
    // don't change submenu when show a platform
    if (id === 'platformDetail' && !_lastId.includes('framework')) {
      return;
    }
    this.refs.panelSubmenu.update({
      items: this.getSubmenu()
    });
  }

  onDidPanelShow() {
    // select initial paenl
    if (!this.lastSubpanelId) {
      this.showSubPanel(this.getSubPanels()[0].id);
    }
  }

  onDidPlatformShow(data) {
    this.refs.platformDetailPanel.update({
      data
    });
    this.showSubPanel('platformDetail');
  }

  onDidFrameworkShow(data) {
    this.refs.frameworkDetailPanel.update({
      data
    });
    this.showSubPanel('frameworkDetail');
  }

  onDidPlatformInstall([platform, callback]) {
    runPlatformCommand('install', { extraArgs: [platform] }).then(
      result => {
        atom.notifications.addSuccess(
          'Platform has been successfully installed', {
            detail: result,
            dismissable: true
          }
        );
        callback(result);
      },
      error => callback(error)
    );
  }

  onDidPlatformUninstall([platform, callback]) {
    runPlatformCommand('uninstall', { extraArgs: [platform] }).then(
      result => {
        atom.notifications.addSuccess(
          'Platform has been successfully uninstalled', {
            detail: result,
            dismissable: true
          }
        );
        callback(result);
      },
      error => callback(error)
    );
  }

  onDidPlatformUpdate([platform, callback]) {
    runPlatformCommand('update', { extraArgs: [platform] }).then(
      result => {
        atom.notifications.addSuccess(
          'Platform has been successfully updated', {
            detail: result,
            dismissable: true
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
      <div className='platform-panel'>
        <PanelSubmenuView ref='panelSubmenu' onpanelchanged={ (id) => this.showSubPanel(id) } />
        { this.getSubPanels().map(item => item.component) }
      </div>
    );
  }
}
