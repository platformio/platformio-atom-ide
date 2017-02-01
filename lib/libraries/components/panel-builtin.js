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

import { LibStorageItem, runLibraryCommand } from '../util';
import { BasePanel } from '../../etch-component';
import LibStoragesView from './storages-view.js';
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
    runLibraryCommand('builtin', undefined, '--json-output').then(items => {
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
