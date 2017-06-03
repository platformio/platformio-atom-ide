/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PioVersions from './pio-versions';
import PlatformIOLogo from '../components/pio-logo';
import React from 'react';


export default class AboutPage extends React.Component {
  render() {
    return (
      <section className='page-container about-page'>
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
          <a className='btn' href='https://pioplus.com/license.html'>License</a>
        </div>
        <div className='block sponsored'>
          <div>
            Part of <a href='https://pioplus.com' className='text-highlight'>PlatformIO Plus</a>
          </div>
          <div className='block'>
            <a className='btn btn-lg btn-primary' href='https://pioplus.com'>Contact Us</a>
          </div>
        </div>
        <div className='block text-smaller'>
          Copyright (C) 2014-
          { new Date().getFullYear() } PlatformIO Plus. All rights reserved.
        </div>
      </section>
    );
  }
}
