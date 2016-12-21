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

import DeferredResult from './deferred-result';
import EtchComponent from '../../etch-component';
import PlatformIOLogo from './pio-logo';
import { dom as etchDom } from 'etch';

export default class AboutView extends EtchComponent {

  render() {
    return (
      <div className='home-about-view'>
        <h1><a href='http://platformio.org'>PlatformIO</a></h1>
        <h2>An open source ecosystem for IoT development</h2>

        <div className="block logo">
          <a href='http://platformio.org'><PlatformIOLogo /></a>
        </div>

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

        <div className='block btn-group'>
          <a className='btn' href='https://github.com/platformio/platformio-atom-ide/blob/develop/HISTORY.md'>IDE Release Notes</a>
          <a className='btn' href='http://docs.platformio.org/en/latest/history.html'>Core Release Notes</a>
          <a className='btn' href='https://github.com/platformio/platformio-atom-ide/blob/develop/LICENSE'>License</a>
        </div>

        <div className='block sponsored'>
          <ul className='list-inline'>
            <li>Sponsored with</li>
            <li><span className='icon icon-heart'></span></li>
            <li>by <a href='https://pioplus.com' className='text-highlight'>PlatformIO Plus</a></li>
          </ul>
          <div className='block'>
            <a className='btn btn-lg btn-primary' href='https://pioplus.com'>Contact Us</a>
          </div>
        </div>

        <div className='block text-smaller'>
          Copyright (C) 2014-{new Date().getFullYear()} PlatformIO. All rights reserved.
        </div>
      </div>
    );
  }
}
