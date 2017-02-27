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
import { LibStorageItem, runLibraryCommand } from '../util';

import LibStoragesView from './storages-view';


export default class LibBuiltInPanel extends BasePanel {

  onDidPanelShow() {
    if (this.isFrozenPanel()) {
      return;
    }
    // reset previous view
    this.refs.libStorges.update({
      items: []
    });
    runLibraryCommand('builtin', null, '--json-output').then(items => {
      this.freezePanel();
      this.refs.libStorges.update({
        items: items.map(
          storage => new LibStorageItem(storage.name, storage.path, storage.items)
        )
      });
    });
  }

  render() {
    return (
      <LibStoragesView ref='libStorges' homebus={ this.props.homebus } items={ [] } />
    );
  }

}
