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

import { CompositeDisposable, Emitter } from 'atom';
import AtomDependenciesStage from './stages/atom-dependencies';
import ConfigurationStage from './stages/configuration';
import InstallerView from './view';
import PlatformIOCoreStage from './stages/platformio-core';
import ProjectExamplesStage from './stages/project-examples';


export default class InstallationManager {

  static LOCK_TIMEOUT = 1 * 60 * 1000; // 1 minute

  constructor() {
    this.eventbus = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.eventbus.on(
      'status-changed', ::this.onDidStatusChange));

    this.stages = [
      new ConfigurationStage(this.eventbus),
      new AtomDependenciesStage(this.eventbus),
      new ProjectExamplesStage(this.eventbus),
      new PlatformIOCoreStage(this.eventbus)
    ];

    this.view = new InstallerView({
      stages: this.stages
    });
    this.panel = null;
  }

  onDidStatusChange() {
    this.view.update();
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
      }
      catch (err) {
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
    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({
        item: this.view
      });
    }
  }

  destroy() {
    this.subscriptions.dispose();
    if (this.panel) {
      this.panel.destroy();
    }
    this.view.destroy();
    return this.stages.map(stage => stage.destroy());
  }

}
