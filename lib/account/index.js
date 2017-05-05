/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import SubPages from '../home/components/subpages';
import routes from './routes';


export default class AccountIndex extends React.Component {

  render() {
    return (
      <section className='page-container account-page'>
        <SubPages routes={ routes } />
      </section>);
  }
}
