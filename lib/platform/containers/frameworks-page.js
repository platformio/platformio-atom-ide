/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { FRAMEWORKS_INPUT_FILTER_KEY, getFrameworksFilter, getVisibleFrameworks } from '../selectors';

import FrameworksList from '../components/frameworks-list';
import { INPUT_FILTER_DELAY } from '../../config';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../home/helpers';
import { lazyUpdateInputValue } from '../../home/actions';


class FrameworksPage extends React.Component {

  static propTypes = {
    items: React.PropTypes.arrayOf(
      React.PropTypes.object.isRequired
    ),
    filterValue: React.PropTypes.string.isRequired,
    setFilter: React.PropTypes.func.isRequired,
    loadRegistryFrameworks: React.PropTypes.func.isRequired,
    showPlatform: React.PropTypes.func.isRequired,
    showFramework: React.PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadRegistryFrameworks();
  }

  render() {
    return (
      <div>
        <FrameworksList { ...this.props } />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: getVisibleFrameworks(state),
    filterValue: getFrameworksFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platform/embedded/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platform/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    setFilter: value => dispatch(lazyUpdateInputValue(FRAMEWORKS_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(FrameworksPage);
