/** @babel */

/**
 * Copyright 2016-present Ivan Kravets <me@ikravets.com>
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

export const ATOM_CONFIG = {
  useBuiltinPIOCore: {
    title: 'Use built-in PlatformIO Core',
    description: 'PlatformIO IDE has built-in the latest stable PlatformIO Core tool ' +
                 'that is used by default. Uncheck this option to use own ' +
                 'version of installed PlatformIO Core (it should be located in the ' +
                 'system `PATH`)',
    type: 'boolean',
    default: true,
    order: 40
  },
  useDevelopmentPIOCore: {
    title: 'Use development version of PlatformIO Core',
    description: 'This option is valid if "Use built-in PlatformIO Core" enabled. ' +
                 'To upgrade to the latest development version, please use ' +
                 '`Menu: PlatformIO > Upgrade PlatformIO Core`.',
    type: 'boolean',
    default: false,
    order: 50
  },
  customPATH: {
    title: 'Custom PATH for `platformio` command',
    description: 'Paste here the result of `echo $PATH` (Unix) / `echo %PATH%` ' +
                 '(Windows) command by typing into your system terminal ' +
                 'if you prefer to use custom version of PlatformIO Core',
    type: 'string',
    default: '',
    order: 100
  },
  showPIOHome: {
    title: 'Show PlatformIO Home on startup',
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
    order: 35
  },
  customLibraryStorages: {
    title: 'Custom Library Storages',
    description: 'Specify folder path to custom library storage. ' +
                 'Multiple paths are allowed, separate them with `, ` (comma + space)',
    type: 'string',
    default: '',
    order: 110
  }
};

export const IS_WINDOWS = Boolean(os.platform().indexOf('win32') > -1);
export const BASE_DIR = path.resolve(path.dirname(__filename), '..');
export const ENV_DIR = _get_env_dir(path.join(BASE_DIR, 'penv'));
export const ENV_BIN_DIR = path.join(ENV_DIR, IS_WINDOWS ? 'Scripts' : 'bin');
export const CACHE_DIR = path.join(BASE_DIR, '.cache');
export const ATOM_DEPENDENCIES = {
  'platformio-ide-terminal': {
    version: '>=2.0.9',
    required: true
  },
  'build': {
    version: '>=0.56.0',
    required: true
  },
  'busy': {
    version: '>=0.1.0',
    required: true
  },
  'autocomplete-clang': {
    version: '>=0.8.9'
  },
  'linter': {
    version: '>=1.11.3'
  },
  'linter-gcc': {
    version: '>=0.6.5'
  },
  'language-ini': {
    version: '>=1.14.0'
  },
  'tool-bar': {
    version: '>=0.2.0'
  },
  'file-icons': {
    version: '>=1.7'
  },
  'minimap': {
    version: '>=4'
  }
};
export const DEFAULT_PIO_ARGS = ['-f', '-c', 'atom'];
export const POST_BUILD_DELAY = 1000;  // ms, dalay before serial monitor restore
export const AUTO_REBUILD_DELAY = 3000;  // ms

export const PLATFORMIO_API_ENDPOINT = 'http://api.platformio.org';


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
