/** @babel */

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

import BaseStage from './base';

export default class ConfigurationStage extends BaseStage {

  get name() {
    return 'Initial configuration';
  }

  check() {    
    const key = 'platformio-ide.defaultToolbarPositionHasBeenSet';
    if (!localStorage.getItem(key)) {
      atom.config.set('tool-bar.position', 'Left');
      localStorage.setItem(key, 'true');
    }
    this.status = BaseStage.STATUS_SUCCESSED;
    return true;
  }

  install() {
    // cleanup not used storage items
    localStorage.removeItem('platformio-ide:install-state');
    localStorage.removeItem('platformio-ide:donate:auto-popup-enabled2');
    localStorage.removeItem('platformio-ide:donate:conter');
    return true;
  }

}
