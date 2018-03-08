/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as pioNodeHelpers from 'platformio-node-helpers';

import AtomDependenciesStage from './stages/atom-dependencies';
import CodeCompletionEngineStage from './stages/code-completion-engine';
import ConfigurationStage from './stages/configuration';
import InstallerProgressModal from './progress-modal';
import { PIO_CORE_MIN_VERSION } from '../config';
import PythonPrompt from './python-prompt';
import StateStorage from './state-storage';


export default class InstallationManager {

  static LOCK_TIMEOUT = 1 * 60 * 1000; // 1 minute
  static STORAGE_STATE_KEY = 'platformio-ide:installer-state';

  constructor() {
    this.stateStorage = new StateStorage(InstallationManager.STORAGE_STATE_KEY);
    this.stages = [
      new ConfigurationStage(this.stateStorage, ::this.onDidStatusChange),
      new CodeCompletionEngineStage(this.stateStorage, ::this.onDidStatusChange),
      new AtomDependenciesStage(this.stateStorage, ::this.onDidStatusChange),
      new pioNodeHelpers.installer.PlatformIOCoreStage(this.stateStorage, ::this.onDidStatusChange, {
        pioCoreMinVersion: PIO_CORE_MIN_VERSION,
        useBuiltinPIOCore: atom.config.get('platformio-ide.useBuiltinPIOCore'),
        setUseBuiltinPIOCore: (value) => atom.config.set('platformio-ide.advanced.useBuiltinPIOCore', value),
        useDevelopmentPIOCore: atom.config.get('platformio-ide.advanced.useDevelopmentPIOCore'),
        pythonPrompt: new PythonPrompt()
      })
    ];

    this.progress = new InstallerProgressModal({
      stages: this.stages
    });
  }

  onDidStatusChange() {
    this.progress.setProps({
      stages: this.stages
    });
    // increase lock timeout on each stage update
    if (this.locked()) {
      this.lock();
    }
  }

  lock() {
    localStorage.setItem('platformio-ide:installer-lock', new Date().getTime());
  }

  unlock() {
    localStorage.removeItem('platformio-ide:installer-lock');
  }

  locked() {
    const lockTime = localStorage.getItem('platformio-ide:installer-lock');
    if (!lockTime) {
      return false;
    }
    return (new Date().getTime() - parseInt(lockTime)) <= InstallationManager.LOCK_TIMEOUT;
  }

  async check() {
    let result = true;
    for (const stage of this.stages) {
      try {
        if (!(await stage.check())) {
          result = false;
        }
      } catch (err) {
        result = false;
        console.warn(err);
      }
    }
    return result;
  }

  install() {
    this.showWizard();
    return Promise.all(
      this.stages.map(stage => stage.install())
    ).then(() => {
      atom.notifications.addSuccess(
        'PlatformIO IDE has been successfully installed!',
        {
          detail: 'Please restart Atom to apply the changes',
          buttons: [
            {
              text: 'Restart',
              onDidClick: () => atom.restartApplication()
            }
          ],
          dismissable: true
        }
      );
    });
  }

  showWizard() {
    this.progress.open();
  }

  destroy() {
    this.progress.destroy();
    return this.stages.map(stage => stage.destroy());
  }

}
