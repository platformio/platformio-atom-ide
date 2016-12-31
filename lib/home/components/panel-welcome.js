/** @babel */
/** @jsx etchDom */

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

import * as utils from '../../utils';

import { getRecentProjects, removeRecentProject } from '../../project/util';

import { BasePanel } from '../../etch-component';
import { CompositeDisposable } from 'atom';
import PioVersions from './pio-versions';
import PlatformIOLogo from './pio-logo';
import RecentProjectsView from './recent-projects-view';
import { dom as etchDom } from 'etch';

export default class WelcomePanel extends BasePanel {

  constructor(props) {
    super(props);

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe(
      'platformio-ide.showPIOHome',
      value => this.refs.openOnStartup.checked = value
    ));

    this._projectsLoaded = false;
  }

  getQuickLinks() {
    return [
      {
        text: 'New Project',
        icon: 'plus',
        callback: () => utils.runAtomCommand('platformio-ide:initialize-new-project'),
      },
      {
        text: 'Import Arduino Project',
        icon: 'repo',
        callback: () => utils.runAtomCommand('platformio-ide:import-arduino-ide-project'),
      },
      {
        text: 'Open Project',
        icon: 'file-directory',
        callback: () => utils.runAtomCommand('application:add-project-folder'),
      },
      {
        text: 'Project Examples',
        icon: 'code',
        callback: () => utils.runAtomCommand('platformio-ide:project-examples'),
      }
    ];
  }

  onDidOpenOnStartup(event) {
    atom.config.set('platformio-ide.showPIOHome', event.target.checked);
  }

  onDidRecentProjectRemove(project) {
    removeRecentProject(project)
      .then(() => this.updateRecentProjects())
      .catch((error) => utils.notifyError(
        'WelcomePanel::onDidRecentProjectRemove', error));
  }

  onDidRecentProjectSelect(project) {
    atom.project.addPath(project.path);
  }

  onDidPanelShow() {
    if (!this._projectsLoaded) {
      this.updateRecentProjects();
    }
  }

  updateRecentProjects() {
    getRecentProjects().toArray()
      .then((items) => {
        this.refs.recentProjects.update({
          items: items
        });
        this._projectsLoaded = true;
      })
      .catch((error) => utils.notifyError(
        'WelcomePanel::updateRecentProjects', error));
  }

  render() {
    return (
      <div className='home-welcome-view'>
        <div className='row'>
          <div className='col-xs text-nowrap'>
            <h1 className='section-heading icon icon-home'>Welcome to <a href='http://platformio.org'>PlatformIO</a></h1>
          </div>
          <div className='col-xs text-right text-nowrap piohome-toggle'>
            <label className='input-label text-smaller'>
              <input ref='openOnStartup'
                className='input-toggle'
                type='checkbox'
                onchange={ this.onDidOpenOnStartup }
                checked={ true } />   Open on startup
            </label>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-6 pio-logo-versions'>
            <a href='http://platformio.org'>
              <PlatformIOLogo />
            </a>
            <PioVersions />
          </div>
          <div className='col-sm-6 quick-links'>
            <h2>Quick access</h2>
            <ul className='list-group'>
              { this.getQuickLinks().map(item => (
                  <li className='list-item'>
                    <a className={ 'btn btn-lg icon icon-' + item.icon } onclick={ item.callback }>
                      { item.text }
                    </a>
                  </li>
                )) }
            </ul>
          </div>
        </div>
        <div className='block web-links text-center'>
          <ul className='list-inline'>
            <li>
              <span className='icon icon-home'></span> <a href='http://platformio.org'>Web</a>
            </li>
            <li>
              ·
            </li>
            <li>
              <span className='icon icon-diff-added'></span> <a href='https://pioplus.com'>Plus</a>
            </li>
            <li>
              ·
            </li>
            <li>
              <span className='icon icon-mark-github'></span> <a href='https://github.com/platformio'>Open Source</a>
            </li>
            <li>
              ·
            </li>
            <li>
              <span className='icon icon-rocket'></span> <a href='http://docs.platformio.org/page/ide/atom.html#quick-start'>Get Started</a>
            </li>
            <li>
              ·
            </li>
            <li>
              <span className='icon icon-question'></span> <a href='http://docs.platformio.org/'>Docs</a>
            </li>
            <li>
              ·
            </li>
            <li>
              <span className='icon icon-comment-discussion'></span> <a href='https://community.platformio.org/'>Community</a>
            </li>
            <li>
              ·
            </li>
            <li>
              <span className='icon icon-bug'></span> <a href='https://github.com/platformio/platformio/issues'>Report an issue</a>
            </li>
          </ul>
          <hr />
        </div>
        <h2 className='block section-heading icon icon-file-submodule'>Recent projects</h2>
        <RecentProjectsView ref='recentProjects' onselect={ ::this.onDidRecentProjectSelect } onremove={ ::this.onDidRecentProjectRemove } />
        <hr />
        <p className='text-center'>
          Do you like PlatformIO? Please star our Open Source projects. Thanks!
          <ul className='list-inline'>
            <li>
              <a href='https://github.com/platformio/platformio-core'>PlatformIO Core</a>
            </li>
            <li>
              <span className='icon icon-star'></span>
            </li>
            <li>
              <a href='https://github.com/platformio/platformio-atom-ide'>PlatformIO IDE</a>
            </li>
          </ul>
        </p>
      </div>
    );
  }

  destroy() {
    this.subscriptions.dispose();
    super.destroy();
  }
}
