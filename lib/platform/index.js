/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import SubPages from '../home/components/subpages';
import routes from './routes';


export default class PlatformPage extends React.Component {

  render() {
    return (
      <section className='page-container platform-page'>
        <SubPages routes={ routes } />
      </section>
    );
  }
}
