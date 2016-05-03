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

import BaseView from '../base-view';
import {CompositeDisposable} from 'atom';
import {QuickLinksView} from './quick-links';
import {RecentProjectsView} from './recent-projects';
import {VersionsView} from '../versions/view';
import {withTemplate} from '../utils';

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
