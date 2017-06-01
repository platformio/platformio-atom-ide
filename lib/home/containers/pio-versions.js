/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';

import React from 'react';


export default class PioVersions extends React.Component {

  constructor() {
    super(...arguments);
    this.state = {
      coreVersion: null
    };
  }

  componentDidMount() {
    utils.getCoreVersion().then(
      version => {
        this.setState({
          coreVersion: version
        });
      },
      (err) => {
        return utils.notifyError('Failed to retrieve PIO Core version', err);
      }
    );
  }

  renderCoreVersion() {
    if (this.state.coreVersion) {
      return this.state.coreVersion;
    }
    return (
      <span className='loading loading-spinner-tiny'></span>
    );
  }

  render() {
    return (
      <div className='block versions'>
        <ul className='list-inline'>
          <li>
            IDE <a href='https://github.com/platformio/platformio-atom-ide/blob/develop/HISTORY.md'><code>{ utils.getIDEVersion() }</code></a>
          </li>
          <li>
            ·
          </li>
          <li>
            Core <a href='https://github.com/platformio/platformio/blob/develop/HISTORY.rst'><code className='inline-block'>{ this.renderCoreVersion() }</code></a>
          </li>
        </ul>
      </div>
    );
  }
}
