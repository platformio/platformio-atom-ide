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
    // force PIO Home after upgrade
    atom.config.set('platformio-ide.showPIOHome', true);
    // cleanup not used storage items
    localStorage.removeItem('platformio-ide:install-state');
    localStorage.removeItem('platformio-ide:donate:auto-popup-enabled2');
    localStorage.removeItem('platformio-ide:donate:conter');
    return true;
  }

}
