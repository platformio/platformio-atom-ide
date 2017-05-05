/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';

import { getTerminalViews, runCmdsInTerminal } from './terminal';

import AuthModal from '../account/containers/auth-modal';
import { TERMINAL_REOPEN_DELAY } from '../config';
import Telemetry from '../telemetry';
import { debugProject } from './debugger.js';
import fs from 'fs';
import ini from 'ini';
import { isPioProject } from '../project/helpers';
import path from 'path';

export default class BuildProvider {

  static ENV_NAME_PREFIX = 'env:';

  static title = 'PlatformIO';

  static baseTargets =[
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
    },
    {
      name: 'Test',
      args: ['test'],
      keymap: 'ctrl-alt-shift-t',
    },
    {
      name: 'Debug',
      args: ['debug'],
      keymap: 'ctrl-alt-shift-t',
    },
  ];

  constructor(cwd) {
    this.projectDir = cwd;
  }

  getNiceName() {
    return BuildProvider.title;
  }

  isEligible() {
    return isPioProject(this.projectDir);
  }

  async settings() {
    let projectConf = null;
    try {
      const content = await new Promise((resolve, reject) => {
        fs.readFile(
          path.join(this.projectDir, 'platformio.ini'),
          'utf-8',
          (err, data) => err ? reject(err) : resolve(data)
        );
      });
      projectConf = ini.parse(content);
    } catch (err) {
      utils.notifyError(`Could not parse "platformio.ini" file in ${this.projectDir}`, err);
      return;
    }

    const projectData = [];
    for (const section of Object.keys(projectConf)) {
      const platform = projectConf[section].platform;
      if (!platform || !section.startsWith(BuildProvider.ENV_NAME_PREFIX)) {
        continue;
      }
      projectData.push({
        env: section.slice(BuildProvider.ENV_NAME_PREFIX.length),
        platform
      });
    }

    const settingItems = [];

    // base targets
    BuildProvider.baseTargets.forEach(target => {
      if (projectData.some(data => this.targetCompatibleWithPlatform(target, data.platform))) {
        settingItems.push(
          this.makeSetting(target.name, target.args.slice(0), target.keymap));
      }
    });

    // project environment targets
    if (projectData.length > 1) {
      projectData.forEach(data => {
        BuildProvider.baseTargets.forEach(target => {
          if (this.targetCompatibleWithPlatform(target, data.platform)) {
            settingItems.push(this.makeSetting(
              target.name, [...target.args.slice(0), '--environment', data.env]
            ));
          }
        });
      });
    }
    return settingItems;
  }

  targetCompatibleWithPlatform(target, platform) {
    if (target.args.includes('program') && platform !== 'atmelavr') {
      return false;
    }
    if (target.args.includes('uploadfs') && !platform.startsWith('espressif')) {
      return false;
    }
    return true;
  }

  makeSetting(name, args, keymap) {
    const proxy = new Proxy(
      new RunTarget(this.projectDir, name, args, keymap),
      {
        get(oTarget, propKey) {
          return Reflect.get(oTarget, propKey);
        },
        ownKeys(oTarget) {
          return Object.getOwnPropertyNames(
            Object.getPrototypeOf(oTarget)
          ).filter(key => key !== 'constructor');
        }
      }
    );
    const setting = {};
    Reflect.ownKeys(proxy).forEach(key => {
      if (!key.startsWith('_') && proxy[key] !== undefined) {
        setting[key] = proxy[key];
      }
    });
    return setting;
  }

}


class RunTarget {

  constructor(projectDir, name, args, keymap = undefined) {
    this._projectDir = projectDir;
    this._name = name;
    this._args = args;
    this._keymap = keymap;
    this._terminalsToRestore = null;
  }

  get _coreTargetName() {
    if (this._args[0] !== 'run') {
      return this._args[0];
    }
    const index = this._args.indexOf('--target');
    return index !== -1 ? this._args[index + 1] : 'build';
  }

  get _coreEnvName() {
    const index = this._args.indexOf('--environment');
    return index !== -1 ? this._args[index + 1] : undefined;
  }

  get _restoreTerminal() {
    if (!atom.config.get('platformio-ide.autoCloseSerialMonitor')) {
      return false;
    }
    return ['upload', 'program', 'uploadfs'].some(arg => this._args.includes(arg));
  }

  get name() {
    let name = `PIO ${this._name}`;
    const coreEnv = this._coreEnvName;
    if (coreEnv) {
      name += ` (${coreEnv})`;
    }
    return name;
  }

  get args() {
    return this._args;
  }

  get exec() {
    return 'platformio';
  }

  get sh() {
    return false;
  }

  get keymap() {
    return this._keymap;
  }

  get env() {
    return Object.assign({}, process.env, {
      PLATFORMIO_FORCE_COLOR: 'true',
      PLATFORMIO_DISABLE_PROGRESSBAR: 'true',
      PLATFORMIO_SETTING_ENABLE_PROMPTS: 'false'
    });
  }

  get errorMatch() {
    return '\\[31m(?<file>src[\\/0-9a-zA-Z\\._\\\\]+):(?<line>\\d+):(?<col>\\d+):\\s+(?<message>[^\\[]+)\\[0m';
  }

  get atomCommandName() {
    if (this._coreEnvName) {
      return undefined;
    }
    return `platformio-ide:target:${this._coreTargetName}-${this._projectDir}`;
  }

  get preBuild() {
    return () => {
      Telemetry.hitEvent('Run', this._coreTargetName, this._coreEnvName);
      if (!this._restoreTerminal) {
        return;
      }
      const terminalViews = getTerminalViews();
      if (!terminalViews) {
        return;
      }
      this._terminalsToRestore = [];
      for (const view of terminalViews) {
        if (view.autoRun.length > 0 && view.autoRun[0].includes('device monitor')) {
          this._terminalsToRestore.push(view.autoRun[0]);
          view.destroy();
        }
      }
    };
  }

  get postBuild() {
    return async (buildOutcome, stdout, stderr) => {
      if (stderr && stderr.toString().includes('pio account login')) {
        const modal = new AuthModal();
        await modal.open();
      }

      if (!buildOutcome) {
        return;
      }

      if (this._coreTargetName === 'debug') {
        debugProject(this._projectDir, this._coreEnvName);
      }

      if (this._terminalsToRestore) {
        setTimeout(() => {
          this._terminalsToRestore.forEach(item => {
            runCmdsInTerminal([item]);
          });
          this._terminalsToRestore = null;
        }, TERMINAL_REOPEN_DELAY);
      }
    };
  }



}
