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

import path from 'path';
import {Disposable} from 'atom';
import {ENV_BIN_DIR} from './constants';
import {useBuiltinPlatformIO} from './utils';

let currentService = null;

function isEnabled() {
  return Boolean(currentService);
}

function run(commands) {
  if (isEnabled()) {
    if (useBuiltinPlatformIO() && process.env.PATH.indexOf(ENV_BIN_DIR) < 0) {
      process.env.PATH = ENV_BIN_DIR + path.delimiter + process.env.PATH;
    }
    currentService.run(commands);
    return 0;
  }
  return -1;
}

module.exports = {
  run: run,

  consumeRunInTerminal: (service) => {
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
};
