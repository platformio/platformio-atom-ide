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
import {VersionsView} from '../versions/view';
import {RecentProjectsView} from './recent-projects';
import {QuickLinksView} from './quick-links';
import {CompositeDisposable} from 'atom';

export class HomeView {

  constructor(uri) {
    this.uri = uri;

    this.subscriptions = new CompositeDisposable();

    // Parse template and retrieve its root element
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

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

  getElement() {
    return this.element;
  }

  destroy() {
    this.subscriptions.dispose();
    this.versionsView.destroy();
    this.quickLinksView.destroy();
    this.element.remove();
  }
}
