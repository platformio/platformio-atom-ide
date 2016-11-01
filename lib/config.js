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
    title: 'Use built-in PlatformIO CLI',
    description: 'This package contains the latest stable PlatformIO CLI tool ' +
                 'which is used by default. Uncheck this option to use own ' +
                 'version of installed PlatformIO (it should be located in the ' +
                 'system `PATH`).',
    type: 'boolean',
    default: true,
    order: 40
  },
  useDevelopPlatformIO: {
    title: 'Use development version of PlatformIO CLI',
    description: 'This option is valid if "Use built-in PlatformIO CLI" enabled. ' +
                 'To upgrade to the latest development version please use ' +
                 '`Menu: PlatformIO > Upgrade PlatformIO CLI`.',
    type: 'boolean',
    default: false,
    order: 50
  },
  customPATH: {
    title: 'Environment PATH to run `platformio`',
    description: 'Paste here the result of `echo $PATH` (Unix) / `echo %PATH%` ' +
                 '(Windows) command by typing into your system terminal',
    type: 'string',
    default: '',
    order: 100
  },
  showHomeScreen: {
    title: 'Show PlatformIO Home screen on startup',
    type: 'boolean',
    default: true,
    order: 0
  },
  highlightActiveProject: {
    title: 'Highlight active project',
    type: 'boolean',
    default: true,
    order: 10
  },
  autoCloseSerialMonitor: {
    title: 'Automatically close Serial Port Monitor before uploading',
    description: '',
    type: 'boolean',
    default: true,
    order: 20
  },
  autoRebuildAutocompleteIndex: {
    title: 'Automatically rebuild C/C++ Project Index',
    description: 'Rebuild C/C++ Project Index (Autocomplete, Linter) when new ' +
                 'libraries are added or `platformio.ini` is modified',
    type: 'boolean',
    default: true,
    order: 30
  },
  showPlatformIOFiles: {
    title: 'Show PlatformIO service files',
    description: 'Do not hide in `Tree View` PlatformIO service files and ' +
                 'directories (`.pioenvs`, `.piolibdeps`, other configuration files)',
    type: 'boolean',
    default: false,
    order: 60
  }
};

export const IS_WINDOWS = Boolean(os.platform().indexOf('win32') > -1);
export const BASE_DIR = path.resolve(path.dirname(__filename), '..');
export const ENV_DIR = _get_env_dir(path.join(BASE_DIR, 'penv'));
export const ENV_BIN_DIR = path.join(ENV_DIR, IS_WINDOWS ? 'Scripts' : 'bin');
export const CACHE_DIR = path.join(BASE_DIR, '.cache');
export const DEPENDENCIES = {
  'build': '>=0.56.0',
  'busy': '>=0.1.0',
  'autocomplete-clang': '>=0.8.9',
  'linter': '>=1.11.3',
  'linter-gcc': '>=0.6.5',
  'platformio-ide-terminal': '>=2.0.9',
  'language-ini': '>=1.14.0',
  'tool-bar': '>=0.2.0'
};
export const STALE_DEPENDENCIES = ['linter-clang', 'ult-terminal'];
export const DEFAULT_PIO_ARGS = ['-f', '-c', 'atom'];
export const POST_BUILD_DELAY = 1000;  // ms, dalay before serial monitor restore
export const AUTO_REBUILD_DELAY = 3000;  // ms

export const NO_ELIGIBLE_PROJECTS_FOUND = '<$NO_ELIGIBLE_PROJECTS_FOUND$>';


function _get_env_dir(defaultEnvDir) {
  if (IS_WINDOWS) {
    // Put the env directory to the root of the current local disk when
    // default path contains non-ASCII characters. Virtualenv will fail to
    for (const char of defaultEnvDir) {
      if (char.charCodeAt(0) > 127) {
        const defaultEnvDirFormat = path.parse(defaultEnvDir);
        return path.format({
          root: defaultEnvDirFormat.root,
          dir: defaultEnvDirFormat.root,
          base: '.pioidepenv',
          name: '.pioidepenv',
        });
      }
    }
  }

  return defaultEnvDir;
}
