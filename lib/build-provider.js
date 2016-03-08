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

import fs from 'fs';
import path from 'path';
import ini from 'ini';
import {clone, getBoards} from './utils';
import {getTerminalViews} from './terminal';
import {openTerminal} from './maintenance';

const ENV_NAME_PREFIX = 'env:';

export class PlatformIOBuildProvider {
  constructor(cwd) {
    this.cwd = cwd;
    this.platformioIniPath = path.join(this.cwd, 'platformio.ini');
    this.title = 'PlatformIO';
    this.targetNamePrefix = this.title + ': ';

    this.targetsBaseSettings = [
      {
        name: 'Build',
        args: ['run'],
        keymap: 'ctrl-alt-b',
      },
      {
        name: 'Clean',
        args: ['run', '--target', 'clean'],
        keymap: 'ctrl-alt-c',
      },
      {
        name: 'Upload',
        args: ['run', '--target', 'upload'],
        keymap: 'ctrl-alt-u',
      },
      {
        name: 'Upload using Programmer',
        args: ['run', '--target', 'program'],
      },
      {
        name: 'Upload SPIFFS image',
        args: ['run', '--target', 'uploadfs'],
      }
    ];
  }

  getNiceName() {
    return this.title;
  }

  isEligible() {
    return fs.statSyncNoException(this.platformioIniPath);
  }

  settings() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.platformioIniPath, (err, data) => {
        if (err) reject(err);
        let settings = this.prepareSettings(this.targetsBaseSettings);
        const allBoards = getBoards();

        let envs = [];
        const boards = {};
        const config = ini.parse(data.toString());
        for (let section of Object.keys(config)) {
          if (section.startsWith(ENV_NAME_PREFIX)) {
            const envName = section.slice(ENV_NAME_PREFIX.length);
            envs.push(envName);
            boards[envName] = config[section].board;
          }
        }

        if (envs.length > 0) {
          let espressifFound = false;
          let atmelavrFound = false;
          for (let env of envs) {
            const platform = config[ENV_NAME_PREFIX + env].platform;
            if ('espressif' === platform) {
              espressifFound = true;
            }
            if ('atmelavr' === platform) {
              atmelavrFound = true;
            }
          }
          if (!espressifFound) {
            settings = settings.filter(argsDoNotContain('uploadfs'));
          }
          if (!atmelavrFound) {
            settings = settings.filter(argsDoNotContain('program'));
          }

          if (atom.config.get('platformio-ide.autoCloseSerialMonitor')) {
            let isHookNecessary = false;
            for (let env of envs) {
              const boardId = boards[env];
              if (!boardId) {
                continue;
              }

              if (allBoards[boardId].upload.require_upload_port) {
                isHookNecessary = true;
                break;
              }
            }
            if (isHookNecessary) {
              settings = settings.map(assignHooks);
            }
          }
        }

        if (envs.length > 1) {
          for (let env of envs) {
            let envSettings = this
              .prepareSettings(this.targetsBaseSettings)
              .map(makeEnvSpecificTarget(env));
            const platform = config[ENV_NAME_PREFIX + env].platform;
            if ('espressif' !== platform) {
              envSettings = envSettings.filter(argsDoNotContain('uploadfs'));
            }
            if ('atmelavr' !== platform) {
              envSettings = envSettings.filter(argsDoNotContain('program'));
            }

            if (atom.config.get('platformio-ide.autoCloseSerialMonitor')) {
              envSettings = envSettings.map(assignHooksToEnvSpecificTarget(boards[env], allBoards));
            }

            settings = settings.concat(envSettings);
          }
        }
        resolve(settings);
      });
    });

    function makeEnvSpecificTarget(env) {
      return function(base) {
        let item = clone(base);
        item.name += ` (env:${env})`;
        item.args.push('--environment');
        item.args.push(env);
        delete item.keymap;
        delete item.atomCommandName;
        return item;
      };
    }

    function argsDoNotContain(arg) {
      return function(item) {
        return item.args.indexOf(arg) === -1;
      };
    }

    function assignHooksToEnvSpecificTarget(boardId, allBoards) {
      return function(item) {
        if (boardId && allBoards[boardId].upload.require_upload_port) {
          return assignHooks(item);
        } else {
          return item;
        }
      };
    }
  }

  prepareSettings(baseSettings) {
    return baseSettings.map(base => {
      let item = clone(base);
      item.name = this.targetNamePrefix + base.name;
      item.exec = "platformio";
      item.sh = false;
      item.env = Object.create(process.env);
      item.env.PLATFORMIO_FORCE_COLOR = "true";
      item.env.PLATFORMIO_DISABLE_PROGRESSBAR = "true";
      item.env.PLATFORMIO_SETTING_ENABLE_PROMPTS = "false";
      item.errorMatch = [
        "\n(?<file>src[\\/0-9a-zA-Z\\._\\\\]+):(?<line>\\d+):(?<col>\\d+)"
      ];
      item.atomCommandName = `platformio-ide:target:${base.name.toLowerCase()}-${this.cwd}`;
      return item;
    });
  }
}

function isViewCreatedBySerialportsMonitorCommand(view) {
  return view.autoRun[0].includes('serialports monitor');
}

function assignHooks(item) {
  if (item.args.indexOf('upload') === -1 &&
      item.args.indexOf('program') === -1 &&
      item.args.indexOf('uploadfs') === -1) {
    return item;
  }
  item.terminalsToRestore = [];
  item.preBuild = function() {
    const terminalViews = getTerminalViews();
    if (-1 === terminalViews) {
      return;
    }
    for (let view of terminalViews) {
      if (isViewCreatedBySerialportsMonitorCommand(view)) {
        this.terminalsToRestore.push(view.autoRun[0]);
        view.destroy();
      }
    }
  };
  item.postBuild = function(succeded) {
    let doRestore = true;
    if (!succeded && this.terminalsToRestore.length > 0) {
      atom.confirm({
        message: 'Do you want to restore serial monitor?',
        detailedMessage: 'Upload failed. Are you sure you want to restore a ' +
                         'Serial Monitor?',
        buttons: {
          'Restore': () => doRestore = true,
          'Do not restore': () => doRestore = false,
        }
      });
    }
    while (this.terminalsToRestore.length > 0) {
      const command = this.terminalsToRestore.splice(0, 1)[0];
      if (doRestore) {
        openTerminal(command);
      }
    }
  };
  return item;
}
