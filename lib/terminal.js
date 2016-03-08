'use babel';

/**
 * Copyright (C) 2016 Ivan Kravets. All rights reserved.
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

import {Disposable} from 'atom';

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

export function runInTerminal(commands) {
  if (isEnabled()) {
    return currentService.run(commands);
  } else {
    return -1;
  }
}

export function consumeRunInTerminal (service) {
  // Only first registered provider will be consumed
  if (isEnabled()) {
    console.warn('Multiple terminal providers found.');
    return new Disposable(() => {});
  }

  currentService = service;

  return new Disposable(() => {
    // Executed when provider package is deactivated
    currentService = null;
  });
}
