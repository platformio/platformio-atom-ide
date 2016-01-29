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

import os from 'os';
import path from 'path';

export default {
  useBuiltinPlatformIO: {
    title: 'Use built-in PlatformIO',
    description: 'This package contains the latest stable PlatformIO CLI tool ' +
                 'which is used by default. Uncheck this option to use own ' +
                 'version of installed PlatformIO (it should be located in the ' +
                 'system `PATH`).',
    type: 'boolean',
    default: true,
    order: 1
  },
  useDevelopPlatformIO: {
    title: 'Use development version of PlatformIO',
    description: 'This option is valid if "Use built-in PlatformIO" enabled. ' +
                 'To upgrade to the latest development version please use ' +
                 '`Menu: PlatformIO > Upgrade PlatformIO`.',
    type: 'boolean',
    default: false,
    order: 2
  }
};

export const WIN32 = Boolean(os.platform().indexOf('win32') > -1);
export const DARWIN = Boolean(os.platform().indexOf('darwin') > -1);
export const BASE_DIR = path.resolve(path.dirname(__filename), '..');
export const ENV_DIR = path.join(BASE_DIR, 'penv');
export const ENV_BIN_DIR = path.join(ENV_DIR, WIN32 ? 'Scripts' : 'bin');
export const CACHE_DIR = path.join(BASE_DIR, '.cache');
