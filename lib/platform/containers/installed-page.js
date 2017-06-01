/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { INSTALLED_INPUT_FILTER_KEY, getInstalledFilter, getVisibleInstalledPlatforms } from '../selectors';

import { INPUT_FILTER_DELAY } from '../../config';
import PlatformsList from '../components/platforms-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../core/actions';


class PlatformInstalledPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
    loadInstalledPlatforms: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    uninstallPlatform: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadInstalledPlatforms();
  }

  render() {
    return (
      <div>
        <div className='block'>
          <span className='icon icon-question'></span>Project can depend on a specific version of development platform, please use <kbd>platform = name@x.y.z</kbd> option for <b>platformio.ini</b> in this case. <a href='http://docs.platformio.org/page/projectconf.html#platform'>More details...</a>
        </div>
        <PlatformsList { ...this.props } actions={ ['reveal', 'uninstall'] } />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: getVisibleInstalledPlatforms(state),
    filterValue: getInstalledFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platform/installed/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platform/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    setFilter: value => dispatch(lazyUpdateInputValue(INSTALLED_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PlatformInstalledPage);
