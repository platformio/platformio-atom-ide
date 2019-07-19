/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as pioNodeHelpers from 'platformio-node-helpers';


const BaseStage = pioNodeHelpers.installer.BaseStage;

export default class ConfigurationStage extends BaseStage {

  static OBSOLATE_STORAGE_ITEMS = [
    'platformio-ide:install-state',
    'platformio-ide:donate:auto-popup-enabled',
    'platformio-ide:donate:auto-popup-enabled2',
    'platformio-ide:donate:conter',
    'platformio-ide:donate:counter',
    'platformio-ide:clang-checked',
    'platformio-ide.defaultToolbarPositionHasBeenSet',
    'platformio-ide:pioplus-username',
    'platformio-ide:pioplus-logged-in',
    'platformio-ide:recent-projects',
    'platformio-ide:telemetry-cid',
  ];

  static OBSOLATE_CONFIG_ITEMS = [
    'platformio-ide.showPIOHome',
    'platformio-ide.showHomeScreen',
    'platformio-ide.useBuiltinPlatformIO',
    'platformio-ide.useDevelopPlatformIO',
    'platformio-ide.showPlatformIOFiles',
    'platformio-ide.useDevelopmentPIOCore',
    'platformio-ide.customLibraryStorages',
    'platformio-ide.customPATH',
    'platformio-ide.checkAuthOnStartup'
  ];


  get name() {
    return 'Initial configuration';
  }

  check() {
    const state = this.state || {};
    if (!state.toolbarSet) {
      atom.config.set('tool-bar.position', 'Left');
      state['toolbarSet'] = true;
    }
    if (!state.fileiconsSet) {
      atom.config.set('file-icons.coloured', false);
      state['fileiconsSet'] = true;
    }
    if (!state.linterBusySet) {
      atom.config.set('linter-ui-default.useBusySignal', false);
      state['linterBusySet'] = true;
    }
    this.state = state;
    this.status = BaseStage.STATUS_SUCCESSED;
    return true;
  }

  install() {
    // cleanup not used config and storage items
    ConfigurationStage.OBSOLATE_STORAGE_ITEMS.forEach(key => localStorage.removeItem(key));
    ConfigurationStage.OBSOLATE_CONFIG_ITEMS.forEach(key => atom.config.get(key) ? atom.config.set(key, undefined) : '');

    // cleanup old PIO IDE Terminal hook
    const terminalStorageKey = 'platformio-ide-terminal.core.autoRunCommand';
    const terminalAutoRunCmd = atom.config.get(terminalStorageKey);
    if (terminalAutoRunCmd && terminalAutoRunCmd.includes('penv')) {
      atom.config.set(terminalStorageKey, undefined);
    }

    return true;
  }

}
