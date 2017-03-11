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

  static OBSOLATE_CONFIG_ITEMS = [
    'platformio-ide.showHomeScreen',
    'platformio-ide.useBuiltinPlatformIO',
    'platformio-ide.useDevelopPlatformIO',
    'platformio-ide.showPlatformIOFiles',
    'platformio-ide.useDevelopmentPIOCore',
    'platformio-ide.customLibraryStorages',
    'platformio-ide.customPATH'
  ];


  get name() {
    return 'Initial configuration';
  }

  check() {
    const state = this.state || {};
    if (!state.hasOwnProperty('toolbarSet') || !state.toolbarSet) {
      atom.config.set('tool-bar.position', 'Left');
      state['toolbarSet'] = true;
    }
    if (!state.hasOwnProperty('fileiconsSet') || !state.fileiconsSet) {
      atom.config.set('file-icons.coloured', false);
      state['fileiconsSet'] = true;
    }
    this.state = state;
    this.status = BaseStage.STATUS_SUCCESSED;
    return true;
  }

  install() {
    // force PIO Home after upgrade
    atom.config.set('platformio-ide.showPIOHome', true);
    // cleanup not used config and storage items
    ConfigurationStage.OBSOLATE_STORAGE_ITEMS.forEach(key => localStorage.removeItem(key));
    ConfigurationStage.OBSOLATE_CONFIG_ITEMS.forEach(key => atom.config.get(key) ? atom.config.set(key, undefined) : '');
    return true;
  }

}
