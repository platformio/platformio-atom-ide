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

import { runCommand, withTemplate } from '../utils';
import BaseView from '../base-view';
import {CompositeDisposable} from 'atom';
import {QuickLinksView} from './quick-links';
import {RecentProjectsView} from './recent-projects';
import {VersionsView} from '../versions/view';
import { getBusyRegistry } from '../init/command';
import semver from 'semver';
import shell from 'shell';

@withTemplate(__dirname)
export class HomeView extends BaseView {

  initialize(uri) {
    this.uri = uri;

    this.subscriptions = new CompositeDisposable();

    this.checkbox = this.element.querySelector('.show-home-screen-checkbox');
    this.checkbox.onchange = e => atom.config.set('platformio-ide.showHomeScreen', e.target.checked);
    this.subscriptions.add(atom.config.observe(
      'platformio-ide.showHomeScreen',
      value => this.checkbox.checked = value
    ));

    this.versionsView = new VersionsView();
    this.element.querySelector('.versions').appendChild(this.versionsView.getElement());

    this.recentProjectsView = new RecentProjectsView();
    this.element.querySelector('.recent-projects').appendChild(this.recentProjectsView.getElement());

    this.quickLinksView = new QuickLinksView();
    this.element.querySelector('.quick-links').appendChild(this.quickLinksView.getElement());

    this.element.querySelector('.btn-pioide-20').onclick = () => {
      if (semver.lt(atom.getVersion(), '1.12.2')) {
        atom.confirm({
          message: `You have outdated version (v${atom.getVersion()}) of Atom Text Editor. PlatformIO IDE requires >= 1.12.2`,
          buttons: {
            'Upgrade Atom': () => shell.openExternal('https://atom.io'),
            'Cancel': () => {}
          }
        });
        return;
      }

      // check GIT
      runCommand('git', ['--version'], (code) => {
        if (code !== 0) {
          atom.confirm({
            message: 'You need to have Git installed in a system to try the latest development version of PlatformIO IDE 2.0. Please install it and re-start Atom.',
            buttons: {
              'Install Git': () => shell.openExternal('https://git-scm.com'),
              'Cancel': () => {}
            }
          });
          return;
        }

        const busy = getBusyRegistry();
        const busyId = 'pio-ide20-installing';
        busy.begin(busyId, 'PlatformIO: Installing PlatformIO IDE 2.0...');
        runCommand(
          atom.packages.getApmPath(),
          ['install', '--production', 'platformio/platformio-atom-ide'],
          (code, stdout, stderr) => {
            busy.end(busyId, code === 0);
            if (code === 0) {
              console.debug(stdout);
              atom.confirm({
                message: 'Please re-start PlatformIO IDE to apply new changes',
                buttons: {
                  'Restart': () => atom.restartApplication(),
                  'Restart later': () => {}
                }
              });
            }
            else {
              console.error(stderr);
              atom.notifications.addError('Could not install PlatformIO IDE 2.0 Preview', {
                detail: stderr,
                dismissable: true
              });
            }
          }
        );

      });

    };
  }

  getTitle() {
    return 'PlatformIO Home';
  }

  getIconName() {
    return 'home';
  }

  getURI() {
    return this.uri;
  }

  destroy() {
    this.subscriptions.dispose();
    this.versionsView.destroy();
    this.quickLinksView.destroy();
    super.destroy();
  }
}
