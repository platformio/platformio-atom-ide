/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';


export default class AccountInfo extends React.Component {
  static propTypes = {
    data: React.PropTypes.object,
  }

  render() {
    return <pre>{ JSON.stringify(this.props.data, null, 2) }</pre>;
  }
}
