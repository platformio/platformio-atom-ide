/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { INSTALLED_INPUT_FILTER_KEY, getInstalledFilter, getVisibleInstalledLibs } from '../selectors';

import { INPUT_FILTER_DELAY } from '../../config';
import { LibraryStorage } from '../storage';
import LibraryStoragesList from '../components/storages-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../core/actions';


class LibraryInstalledPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.instanceOf(LibraryStorage).isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadInstalledLibs: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    uninstallLibrary: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadInstalledLibs();
  }

  render() {
    return (
      <LibraryStoragesList {...this.props} />
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: getVisibleInstalledLibs(state),
    filterValue: getInstalledFilter(state),
    searchLibrary: (query, page) => goTo(ownProps.history, '/lib/registry/search', { query, page }),
    showLibrary: idOrManifest => goTo(ownProps.history, '/lib/installed/show', { idOrManifest })
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(LibraryInstalledPage);
