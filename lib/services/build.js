/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as pioNodeHelpers from 'platformio-node-helpers';

import { getTerminalViews, runCmdsInTerminal } from './terminal';

import { TERMINAL_REOPEN_DELAY } from '../config';
import { debugProject } from './debugger';
import fs from 'fs';
import { isPIOProject } from '../utils';

export default class BuildProvider {

  constructor(cwd) {
    this.projectDir = fs.realpathSync(cwd);
  }

  getNiceName() {
    return 'PlatformIO';
  }

  isEligible() {
    return isPIOProject(this.projectDir);
  }

  async settings() {
    const pt = new pioNodeHelpers.project.ProjectTasks(this.projectDir, 'atom');
    return (await pt.getGeneralTasks())
      .filter(task => !(task.coreTarget === 'upload' && task.args.includes('monitor')))
      .map(task => {
        if (task.coreTarget === 'debug') {
          task.name = 'Debug';
          task.description = undefined;
        }
        return this.makeSetting(task);
      }
    );
  }

  makeSetting(projectTask) {
    const proxy = new Proxy(
      new AtomBuildTarget(this.projectDir, projectTask),
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


class AtomBuildTarget {

  constructor(projectDir, projectTask) {
    this._projectDir = projectDir;
    this._projectTask = projectTask;
    this._terminalsToRestore = null;
  }

  get _restoreTerminal() {
    if (!atom.config.get('platformio-ide.autoCloseSerialMonitor')) {
      return false;
    }
    return ['upload', 'program', 'uploadfs'].some(arg => this._projectTask.args.includes(arg));
  }

  get name() {
    return `PIO ${this._projectTask.title}`;
  }

  get args() {
    return this._projectTask.args;
  }

  get exec() {
    return 'platformio';
  }

  get sh() {
    return false;
  }

  get keymap() {
    switch (this._projectTask.coreTarget) {
      case 'upload':
        return 'ctrl-alt-u';
      case 'clean':
        return 'ctrl-alt-c';
      case 'test':
        return 'ctrl-alt-t';
    }
    return 'ctrl-alt-b';
  }

  get errorMatch() {
    return '\\[31m(?<file>src[\\/0-9a-zA-Z\\._\\\\]+):(?<line>\\d+):(?<col>\\d+):\\s+(?<message>[^\\[]+)\\[0m';
  }

  get atomCommandName() {
    if (this._projectTask.coreEnv) {
      return undefined;
    }
    return `platformio-ide:target:${this._projectTask.id.toLowerCase()}-${this._projectDir}`;
  }

  get preBuild() {
    this.env = Object.assign({}, process.env, {
      PLATFORMIO_FORCE_COLOR: 'true',
      PLATFORMIO_DISABLE_PROGRESSBAR: 'true',
      PLATFORMIO_SETTING_ENABLE_PROMPTS: 'false'
    });

    return () => {
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
        atom.workspace.open('platformio-home://account');
      }

      if (!buildOutcome) {
        return;
      }

      if (this._projectTask.coreTarget === 'debug') {
        debugProject(this._projectDir, this._projectTask.coreEnv);
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
