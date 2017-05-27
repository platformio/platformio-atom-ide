/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';


export default class MaybeInProgressButton extends React.Component {
  static propTypes = {
    isInProgress: PropTypes.bool.isRequired,
    className: PropTypes.string,
    children: PropTypes.arrayOf(PropTypes.element),
  }

  static defaultProps = {
    className: '',
  }

  render() {
    return (
      <button {...this.props} disabled={ this.props.isInProgress } className={ this.props.isInProgress ? this.props.className + ' btn-inprogress' : this.props.className }>
        { this.props.children }
      </button>);
  }
}
