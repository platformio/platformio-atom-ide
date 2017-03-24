/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Disposable } from 'atom';


let currentService = null;

export function BusyConsumer(service) {
  currentService = service;
  return new Disposable(() => {
    currentService = null;
  });
}

export function beginBusy(identifier, text) {
  if (currentService) {
    currentService.begin(identifier, `PlatformIO: ${text}`);
  }
}

export function endBusy(identifier, success = true) {
  if (currentService) {
    currentService.end(identifier, success);
  }
}
