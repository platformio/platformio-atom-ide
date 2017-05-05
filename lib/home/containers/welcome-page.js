/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';

import PioVersions from './pio-versions';
import PlatformIOLogo from '../components/pio-logo';
import React from 'react';
import RecentProjectsBlock from '../../project/containers/recent-block';


export default class WelcomePage extends React.Component {

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

  render() {
    return (
      <section className='page-container welcome-page'>
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
                  <li className='list-item' key={ item.text }>
                    <a className={ 'btn btn-lg icon icon-' + item.icon } onClick={ item.callback }>
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
        <RecentProjectsBlock />
        <hr />
        <p className='text-center'>
          If you enjoy using PlatformIO, please star our projects on GitHub!
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
      </section>
    );
  }

}
