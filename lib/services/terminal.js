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

export function TerminalConsumer(service) {
  // Only first registered provider will be consumed
  if (currentService) {
    console.warn('Multiple terminal providers found.');
    return new Disposable(() => {
    });
  }
  currentService = service;
  updateTerminalProcessEnv();
  return new Disposable(() => {
    // Executed when provider package is deactivated
    currentService = null;
  });
}

export function getTerminalViews() {
  return currentService ? currentService.getTerminalViews() : null;
}

export function updateTerminalProcessEnv() {
  if (!currentService) {
    return false;
  }
  const variables = {
    PLATFORMIO_CALLER: process.env.PLATFORMIO_CALLER,
    PLATFORMIO_IDE: process.env.PLATFORMIO_IDE,
    PATH: process.env.PATH
  };
  if (process.env.Path) {
    variables.Path = process.env.Path;
  }
  return currentService.updateProcessEnv(variables);

}

export function runCmdsInTerminal(commands) {
  if (currentService) {
    updateTerminalProcessEnv();
    return currentService.run(commands);
  }
  atom.notifications.addError('PlatformIO: Terminal service is not registered.', {
    detail: 'Make sure that "platformio-ide-terminal" package is installed and activated.',
    dismissable: true
  });
  return false;
}
