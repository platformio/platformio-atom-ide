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

export function BusyConsumer(registry) {
  currentService = registry.create();
  return new Disposable(() => {
    currentService.dispose();
  });
}

export function beginBusy(text) {
  if (currentService) {
    try {
      currentService.add(`PlatformIO: ${text}`);
    } catch (err) {}
  }
}

export function endBusy() {
  if (currentService) {
    currentService.clear();
  }
}
