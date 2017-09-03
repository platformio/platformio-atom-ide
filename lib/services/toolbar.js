/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Disposable } from 'atom';


let currentService = null;

export function ToolbarConsumer(toolBar) {
  if (currentService) {
    return;
  }
  currentService = toolBar('platformio-ide');

  currentService.addButton({
    icon: 'home',
    callback: 'platformio-ide:home',
    tooltip: 'PlatformIO Home'
  });

  currentService.addButton({
    icon: 'check',
    callback: 'platformio-ide:target:build',
    tooltip: 'PlatformIO: Build'
  });

  currentService.addButton({
    icon: 'arrow-right',
    callback: 'platformio-ide:target:upload',
    tooltip: 'PlatformIO: Upload'
  });

  currentService.addButton({
    icon: 'trashcan',
    callback: 'platformio-ide:target:clean',
    tooltip: 'PlatformIO: Clean'
  });

  currentService.addButton({
    icon: 'bug',
    callback: 'platformio-ide:target:debug',
    tooltip: 'PlatformIO: Debug'
  });

  currentService.addButton({
    icon: 'checklist',
    callback: 'build:select-active-target',
    tooltip: 'Run other target...'
  });

  currentService.addButton({
    icon: 'fold',
    callback: 'build:toggle-panel',
    tooltip: 'Toggle Build Panel'
  });

  currentService.addSpacer();

  currentService.addButton({
    icon: 'search',
    callback: 'project-find:show',
    tooltip: 'Find in Project...'
  });

  currentService.addButton({
    icon: 'terminal',
    callback: 'platformio-ide:maintenance.open-terminal',
    tooltip: 'Terminal'
  });

  currentService.addButton({
    icon: 'plug',
    callback: 'platformio-ide:maintenance.serial-monitor',
    tooltip: 'Serial Monitor'
  });

  currentService.addSpacer();

  currentService.addButton({
    icon: 'gear',
    callback: 'application:show-settings',
    tooltip: 'PlatformIO IDE Settings'
  });

  return new Disposable(() => {
    currentService.removeItems();
    currentService = null;
  });
}
