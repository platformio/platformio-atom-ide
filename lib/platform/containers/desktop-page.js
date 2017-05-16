/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { DESKTOP_INPUT_FILTER_KEY, getDesktopFilter, getVisibleDesktopPlatforms } from '../selectors';

import { INPUT_FILTER_DELAY } from '../../config';
import PlatformsList from '../components/platforms-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../core/actions';


class PlatformDesktopPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
    loadRegistryPlatforms: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadRegistryPlatforms();
  }

  render() {
    return (
      <div>
        <div className='block text'>
          <span className='icon icon-question'></span> Native development platform depends on system <kbd>gcc</kbd>. Please install it and check <kbd>gcc --version</kbd> command.
        </div>
        <PlatformsList { ...this.props } actions={ ['install'] } />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: getVisibleDesktopPlatforms(state),
    filterValue: getDesktopFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platform/desktop/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platform/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    setFilter: value => dispatch(lazyUpdateInputValue(DESKTOP_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PlatformDesktopPage);
