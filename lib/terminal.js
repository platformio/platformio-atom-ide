'use babel';

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import { Disposable } from 'atom';

let currentService = null;

function isEnabled() {
  return Boolean(currentService);
}

export function getTerminalViews() {
  if (isEnabled()) {
    return currentService.getTerminalViews();
  } else {
    return -1;
  }
}

export function destroyTerminalView(view) {
  if (isEnabled()) {
    return currentService.destroyTerminalView(view);
  } else {
    return -1;
  }
}

export function runCmdsInTerminal(commands) {
  if (isEnabled()) {
    return currentService.run(commands);
  }
  atom.notifications.addError('PlatformIO: Terminal service is not registered.', {
    detail: 'Make sure that "platformio-ide-terminal" package is installed.',
    dismissable: true
  });
  return -1;
}

export function consumeRunInTerminal(service) {
  // Only first registered provider will be consumed
  if (isEnabled()) {
    console.warn('Multiple terminal providers found.');
    return new Disposable(() => {
    });
  }
  currentService = service;
  return new Disposable(() => {
    // Executed when provider package is deactivated
    currentService = null;
  });
}
