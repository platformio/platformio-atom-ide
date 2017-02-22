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

import { LibStorageItem, runLibraryCommand } from '../util';
import { BasePanel } from '../../etch-component';
import LibStoragesView from './storages-view';
import { dom as etchDom } from 'etch';

export default class LibBuiltInPanel extends BasePanel {

  constructor(props) {
    super(props);
    this._cache = undefined;
  }

  onDidPanelShow() {
    if (this._cache) {
      return;
    }
    runLibraryCommand('builtin', null, '--json-output').then(items => {
      this._cache = items.map(
        storage => new LibStorageItem(storage.name, storage.path, storage.items)
      );
      this.refs.libStorges.update({
        items: this._cache
      });
    });

  }

  render() {
    return (
      <LibStoragesView ref='libStorges' homebus={ this.props.homebus } items={ [] } />
    );
  }

}
