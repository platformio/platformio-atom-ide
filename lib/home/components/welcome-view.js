/** @babel */
/** @jsx etchDom */

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

import * as utils from '../../utils';

import { CompositeDisposable } from 'atom';
import DeferredResult from './deferred-result';
import EtchComponent from '../../etch-component';
import PlatformIOLogo from './pio-logo';
import RecentProjectsView from './recent-projects-view';
import { dom as etchDom } from 'etch';

export default class WelcomeView extends EtchComponent {

  constructor(props) {
    super(props);

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe(
      'platformio-ide.showPIOHome',
      value => this.refs.openOnStartup.checked = value
    ));
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

  openOnStartupChanged(event) {
    atom.config.set('platformio-ide.showPIOHome', event.target.checked);
  }

  render() {
    return (
      <div className='home-welcome-view'>
        <div className='block head'>
          <div className='title'>
            <h1 className='section-heading icon icon-home'>Welcome to <a href='http://platformio.org'>PlatformIO</a></h1>
          </div>
          <div className='toggle'>
            <label className='input-label text-smaller'>
              <input ref='openOnStartup' className='input-toggle' type='checkbox' onchange={this.openOnStartupChanged} checked={true} />
                &nbsp; Open at startup
            </label>
          </div>
        </div>

        <div className='block logo-and-links'>
          <div className='pio-logo-versions'>
            <a href='http://platformio.org'><PlatformIOLogo /></a>
            <div className='block versions'>
              <ul className='list-inline'>
                <li>
                  IDE <a href='https://github.com/platformio/platformio-atom-ide/blob/develop/HISTORY.md'>
                  <code>{utils.getIDEVersion()}</code></a>
                </li>
                <li>·</li>
                <li>
                  Core <a href='https://github.com/platformio/platformio/blob/develop/HISTORY.rst'>
                  <code><DeferredResult defer={utils.getCoreVersionAsync()} /></code></a>
                </li>
              </ul>
            </div>
          </div>
          <div className='quick-links'>
            <h2>Quick access</h2>
            <ul className='list-group'>
              {this.getQuickLinks().map(item =>
              <li className='list-item'>
                <a className={'btn btn-lg icon icon-' + item.icon} onclick={item.callback}>{item.text}</a>
              </li>
              )}
            </ul>
          </div>
        </div>

        <div className='block web-links'>
          <ul className='list-inline'>
            <li><span className='icon icon-home'></span> <a href='http://platformio.org'>Web</a></li>
            <li>·</li>
            <li><span className='icon icon-diff-added'></span> <a href='https://pioplus.com'>Plus</a></li>
            <li>·</li>
            <li><span className='icon icon-mark-github'></span> <a href='https://github.com/platformio'>Open Source</a></li>
            <li>·</li>
            <li><span className='icon icon-rocket'></span> <a href='http://docs.platformio.org/page/ide/atom.html#quick-start'>Get Started</a></li>
            <li>·</li>
            <li><span className='icon icon-question'></span> <a href='http://docs.platformio.org/'>Docs</a></li>
            <li>·</li>
            <li><span className='icon icon-comment-discussion'></span> <a href='https://community.platformio.org/'>Community</a></li>
            <li>·</li>
            <li><span className='icon icon-bug'></span> <a href='https://github.com/platformio/platformio/issues'>Report an issue</a></li>
          </ul>
          <hr />
        </div>

        <h2 className='block section-heading icon icon-file-submodule'>
          Recent projects
        </h2>
        <RecentProjectsView />
      </div>
    );
  }

  destroy() {
    this.subscriptions.dispose();
    super.destroy();
  }
}
