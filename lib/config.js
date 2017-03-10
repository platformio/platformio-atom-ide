/** @babel */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import fs from 'fs-plus';
import os from 'os';
import path from 'path';


export const ATOM_CONFIG = {
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
    description: 'Rebuild C/C++ Project Index (Intelligent Code Completion, ' +
      'Smart Code Linter) when new libraries are added or [platformio.ini](http://docs.platformio.org/page/projectconf.html) is modified',
    type: 'boolean',
    default: true,
    order: 30
  },
  useBuiltinPIOCore: {
    title: 'Use built-in PlatformIO Core',
    description: 'PlatformIO IDE has built-in [PlatformIO Core](http://docs.platformio.org/en/latest/core.html) ' +
      'and depends on it. Uncheck this option (NOT RECOMMENDED) to use own version of ' +
      'installed PlatformIO Core (it should be located in the system `PATH`)',
    type: 'boolean',
    default: true,
    order: 40
  },
  advanced: {
    type: 'object',
    title: 'Advanced',
    order: 50,
    properties: {
      showPlatformIOFiles: {
        title: 'Show PlatformIO service files',
        description: 'Do not hide in `Tree View` PlatformIO service files and ' +
          'directories (`.pioenvs`, `.piolibdeps`, other configuration files)',
        type: 'boolean',
        default: false,
        order: 0
      },
      useDevelopmentPIOCore: {
        title: 'Use development version of PlatformIO Core',
        description: 'This option is valid if "Use built-in PlatformIO Core" enabled. ' +
        'To upgrade to the latest development version, please use ' +
        '`Menu: PlatformIO > Upgrade PlatformIO Core`.',
        type: 'boolean',
        default: false,
        order: 10
      },
      customLibraryStorages: {
        title: 'Custom Library Storages',
        description: 'Specify folder path to custom library storage. ' +
          'You will be able to list installed libraries, check updates or install ' +
          'new libraries. Multiple paths are allowed, separate them with `, ` (comma + space)',
        type: 'string',
        default: '',
        order: 20
      },
      customPATH: {
        title: 'Custom PATH for `platformio` command',
        description: 'Paste here the result of `echo $PATH` (Unix) / `echo %PATH%` ' +
          '(Windows) command by typing into your system terminal ' +
          'if you prefer to use custom version of PlatformIO Core',
        type: 'string',
        default: '',
        order: 30
      }
    }
  }
};

export const IS_WINDOWS = Boolean(os.platform().includes('win32'));
export const PKG_BASE_DIR = path.resolve(path.dirname(__filename), '..');
export const PIO_HOME_DIR = process.env.PLATFOMRIO_HOME_DIR ? process.env.PLATFORMIO_HOME_DIR : path.join(fs.getHomeDirectory(), '.platformio');
export const CACHE_DIR = path.join(PIO_HOME_DIR, '.cache');
export const ENV_DIR = _get_env_dir(path.join(PIO_HOME_DIR, 'penv'));
export const ENV_BIN_DIR = path.join(ENV_DIR, IS_WINDOWS ? 'Scripts' : 'bin');
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
export const PIO_CORE_REQUIREMENT = '>=3.3.0-a.14';
export const DEFAULT_PIO_ARGS = ['-f', '-c', 'atom'];
export const POST_BUILD_DELAY = 1000; // ms, dalay before serial monitor restore
export const AUTO_REBUILD_DELAY = 3000; // ms

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
