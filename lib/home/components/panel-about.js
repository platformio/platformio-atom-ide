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

import { BasePanel, jsxDOM } from '../../view';

import PioVersions from './pio-versions';
import PlatformIOLogo from './pio-logo';


export default class AboutPanel extends BasePanel {

  render() {
    return (
      <div className='home-about-view'>
        <h1><a href='http://platformio.org'>PlatformIO</a></h1>
        <h2>An open source ecosystem for IoT development</h2>
        <div className="block logo">
          <a href='http://platformio.org'>
            <PlatformIOLogo />
          </a>
        </div>
        <PioVersions />
        <div className='block btn-group'>
          <a className='btn' href='https://github.com/platformio/platformio-atom-ide/blob/develop/HISTORY.md'>IDE Release Notes</a>
          <a className='btn' href='http://docs.platformio.org/en/latest/history.html'>Core Release Notes</a>
          <a className='btn' href='https://github.com/platformio/platformio-atom-ide/blob/develop/LICENSE'>License</a>
        </div>
        <div className='block sponsored'>
          <ul className='list-inline'>
            <li>
              Sponsored with
            </li>
            <li>
              <span className='icon icon-heart'></span>
            </li>
            <li>
              by <a href='https://pioplus.com' className='text-highlight'>PlatformIO Plus</a>
            </li>
          </ul>
          <div className='block'>
            <a className='btn btn-lg btn-primary' href='https://pioplus.com'>Contact Us</a>
          </div>
        </div>
        <div className='block text-smaller'>
          Copyright (C) 2014-
          { new Date().getFullYear() } PlatformIO. All rights reserved.
        </div>
      </div>
    );
  }
}
