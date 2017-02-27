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

import { BasePanel, jsxDOM } from '../../view';
import { LibStorageItem, getCustomStorages, runLibraryCommand } from '../util';

import LibStoragesView from './storages-view';
import { getPioProjects } from '../../project/util';
import path from 'path';


export default class LibUpdatesPanel extends BasePanel {

  onDidPanelShow() {
    // reset previous view
    const storages = this.getLibStorages();
    this.refs.libStorges.update({
      items: storages
    });

    storages.forEach((storage, index) => {
      runLibraryCommand('update', {
        storage: storage.path,
        extraArgs: ['--only-check', '--json-output']
      }).then(items => {
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
      item => item.actions = LibStorageItem.ACTION_REVEAL | LibStorageItem.ACTION_UPDATE
    );
    return items;
  }

  render() {
    return (
      <LibStoragesView ref='libStorges' homebus={ this.props.homebus } items={ this.getLibStorages() } />
    );
  }

}
