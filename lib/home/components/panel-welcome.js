/** @babel */
/** @jsx jsxDOM */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as utils from '../../utils';

import { BasePanel, jsxDOM } from '../../view';

import PioVersions from './pio-versions';
import PlatformIOLogo from './pio-logo';
import RecentProjects from '../../project/recent';


export default class WelcomePanel extends BasePanel {

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

  onDidPanelShow() {
    this.refs.recentProjects.update();
  }

  render() {
    return (
      <div className='home-welcome-view'>
        <h1 className='section-heading icon icon-home'>Welcome to <a href='http://platformio.org'>PlatformIO</a></h1>
        <div className='block row text-center'>
          <div className='col-xs pio-logo-versions'>
            <a href='http://platformio.org'>
              <PlatformIOLogo />
            </a>
            <PioVersions />
          </div>
          <div className='col-xs quick-links'>
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
        <div className='block text-center'>
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
        <RecentProjects ref='recentProjects' />
        <hr />
        <p className='text-center'>
          If you enjoy using PlatformIO, please star our Open Source Projects. Thank you very much!
          <ul className='list-inline'>
            <li>
              <a href='https://github.com/platformio/platformio-core'>PlatformIO Core</a>
            </li>
            <li>
              <span className='icon icon-star text-warning'></span>
            </li>
            <li>
              <a href='https://github.com/platformio/platformio-atom-ide'>PlatformIO IDE</a>
            </li>
          </ul>
        </p>
      </div>
    );
  }

}
