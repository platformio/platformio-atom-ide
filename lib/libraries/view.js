'use babel';

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

import BaseView from '../base-view';
import {openTerminal} from '../maintenance';
import {withTemplate} from '../utils';

@withTemplate(__dirname)
export class LibrariesView extends BaseView{

  initialize(uri) {
    this.uri = uri;
    this.element.querySelector('.btn-cmd-lib').onclick = () => {
      openTerminal('pio lib --help');
    };
    this.element.querySelector('.btn-cmd-lib-search').onclick = () => {
      openTerminal('pio lib search --help');
    };
  }

  getTitle() {
    return 'Library Manager';
  }

  getIconName() {
    return 'code';
  }

  getURI() {
    return this.uri;
  }

  destroy() {
    super.destroy();
  }
}
