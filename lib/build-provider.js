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

import { getTerminalViews, runCmdsInTerminal } from './terminal';
import { POST_BUILD_DELAY } from './config';
import { clone } from './utils';
import fs from 'fs';
import ini from 'ini';
import { isPioProject } from './project/util';
import path from 'path';

const ENV_NAME_PREFIX = 'env:';

export default class PlatformIOBuildProvider {
  constructor(cwd) {
    try {
      this.cwd = fs.realpathSync(cwd);
    } catch (e) {
      this.cwd = cwd;
    }

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
        name: 'Test',
        args: ['test'],
        keymap: 'ctrl-alt-shift-t',
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
    return isPioProject(this.cwd);
  }

  settings() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.platformioIniPath, (err, data) => {
        if (err) {
          reject(err);
        }
        let settings = this.prepareSettings(this.targetsBaseSettings);

        const envs = [];
        const boards = {};
        const config = ini.parse(data.toString());
        for (const section of Object.keys(config)) {
          if (section.startsWith(ENV_NAME_PREFIX)) {
            const envName = section.slice(ENV_NAME_PREFIX.length);
            envs.push(envName);
            boards[envName] = config[section].board;
          }
        }

        if (envs.length > 0) {
          let espressifFound = false;
          let atmelavrFound = false;
          for (const env of envs) {
            const platform = config[ENV_NAME_PREFIX + env].platform;
            if (platform.startsWith('espressif')) {
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
        }

        if (envs.length > 1) {
          for (const env of envs) {
            let envSettings = this
              .prepareSettings(this.targetsBaseSettings)
              .map(makeEnvSpecificTarget(env));
            const platform = config[ENV_NAME_PREFIX + env].platform;
            if (!platform.startsWith('espressif')) {
              envSettings = envSettings.filter(argsDoNotContain('uploadfs'));
            }
            if ('atmelavr' !== platform) {
              envSettings = envSettings.filter(argsDoNotContain('program'));
            }

            settings = settings.concat(envSettings);
          }
        }

        if (atom.config.get('platformio-ide.autoCloseSerialMonitor')) {
          settings = settings.map(assignHooks);
        }

        resolve(settings);
      });
    });

    function makeEnvSpecificTarget(env) {
      return function(base) {
        const item = clone(base);
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
  }

  prepareSettings(baseSettings) {
    return baseSettings.map(base => {
      const item = clone(base);
      item.name = this.targetNamePrefix + base.name;
      item.exec = 'platformio';
      item.sh = false;
      item.env = Object.create(process.env);
      item.env.PLATFORMIO_FORCE_COLOR = 'true';
      item.env.PLATFORMIO_DISABLE_PROGRESSBAR = 'true';
      item.env.PLATFORMIO_SETTING_ENABLE_PROMPTS = 'false';
      item.errorMatch = [
        '\n\\x1B\\[31m(?<file>src[\\/0-9a-zA-Z\\._\\\\]+):(?<line>\\d+):(?<col>\\d+)'
      ];
      item.atomCommandName = `platformio-ide:target:${base.name.toLowerCase()}-${this.cwd}`;
      return item;
    });
  }
}

function isViewCreatedBySerialportsMonitorCommand(view) {
  return view.autoRun.length > 0 && view.autoRun[0].includes('device monitor');
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
    for (const view of terminalViews) {
      if (isViewCreatedBySerialportsMonitorCommand(view)) {
        this.terminalsToRestore.push(view.autoRun[0]);
        view.destroy();
      }
    }
  };
  item.postBuild = function(succeded) {
    if (!succeded) {
      return;
    }
    setTimeout(() => {
      while (this.terminalsToRestore.length > 0) {
        runCmdsInTerminal(this.terminalsToRestore.splice(0, 1));
      }
    }, POST_BUILD_DELAY);
  };
  return item;
}
