/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { UPDATES_INPUT_FILTER_KEY, getUpdatesFilter, getVisiblePlatformUpdates } from '../selectors';

import { INPUT_FILTER_DELAY } from '../../config';
import PlatformsList from '../components/platforms-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../home/helpers';
import { lazyUpdateInputValue } from '../../core/actions';


class PlatformUpdatesPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
    loadPlatformUpdates: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    updatePlatform: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadPlatformUpdates();
  }

  render() {
    return (
      <PlatformsList { ...this.props } actions={ ['reveal', 'update'] } />
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: getVisiblePlatformUpdates(state),
    filterValue: getUpdatesFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platform/installed/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platform/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    setFilter: value => dispatch(lazyUpdateInputValue(UPDATES_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PlatformUpdatesPage);
