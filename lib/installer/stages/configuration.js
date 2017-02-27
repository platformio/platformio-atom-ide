/** @babel */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import BaseStage from './base';


export default class ConfigurationStage extends BaseStage {

  static OBSOLATE_STORAGE_ITEMS = [
    'platformio-ide:install-state',
    'platformio-ide:donate:auto-popup-enabled',
    'platformio-ide:donate:conter',
    'platformio-ide:clang-checked',
    'platformio-ide.defaultToolbarPositionHasBeenSet'
  ];

  get name() {
    return 'Initial configuration';
  }

  check() {
    if (!this.state || !this.state.hasOwnProperty('toolbarSet') || !this.state.toolbarSet) {
      atom.config.set('tool-bar.position', 'Left');
      this.state = {
        toolbarSet: true
      };
    }
    this.status = BaseStage.STATUS_SUCCESSED;
    return true;
  }

  install() {
    // force PIO Home after upgrade
    atom.config.set('platformio-ide.showPIOHome', true);
    // cleanup not used storage items
    ConfigurationStage.OBSOLATE_STORAGE_ITEMS.forEach(key => localStorage.removeItem(key));
    return true;
  }

}
