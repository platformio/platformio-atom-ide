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

import { LibStorageItem, getCustomStorages, runLibraryCommand } from '../util';
import { BasePanel } from '../../view';
import { CompositeDisposable } from 'atom';
import LibStoragesView from './storages-view';
import { dom as etchDom } from 'etch';
import { getPioProjects } from '../../project/util';
import path from 'path';

export default class LibInstalledPanel extends BasePanel {

  constructor() {
    super(...arguments);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.props.homebus.on(
      'lib-install', ::this.unfreezePanel));
    this.subscriptions.add(this.props.homebus.on(
      'lib-uninstall', ::this.unfreezePanel));
    this.subscriptions.add(this.props.homebus.on(
      'lib-update', ::this.unfreezePanel));
  }

  onDidPanelShow() {
    if (this.isFrozenPanel()) {
      return;
    }
    // reset previous view
    const storages = this.getLibStorages();
    this.refs.libStorges.update({
      items: storages
    });

    storages.forEach((storage, index) => {
      runLibraryCommand('list', storage.path, '--json-output').then(items => {
        this.freezePanel();
        storages[index].items = items;
        this.refs.libStorges.update({
          items: storages
        });
      });
    });
  }

  getLibStorages() {
    let items = getPioProjects().map(
      p => new LibStorageItem(`Project: ${path.basename(p)}`, p)
    );
    items = items.concat(getCustomStorages().map(
      p => new LibStorageItem(`Storage: ${path.basename(p)}`, p)
    ));
    items.push(new LibStorageItem('Global Storage'));
    items.forEach(
      item => item.actions = LibStorageItem.ACTION_REVEAL | LibStorageItem.ACTION_UNINSTALL
    );
    return items;
  }

  render() {
    return (
      <LibStoragesView ref='libStorges' homebus={ this.props.homebus } items={ this.getLibStorages() } />
    );
  }

}
