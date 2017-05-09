/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { UPDATES_INPUT_FILTER_KEY, getUpdatesFilter, getVisibleLibUpdates } from '../selectors';

import { INPUT_FILTER_DELAY } from '../../config';
import { LibraryStorage } from '../storage';
import LibraryStoragesList from '../components/storages-list';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../home/helpers';
import { lazyUpdateInputValue } from '../../core/actions';


class LibraryUpdatesPage extends React.Component {

  static propTypes = {
    items: React.PropTypes.arrayOf(
      React.PropTypes.instanceOf(LibraryStorage).isRequired
    ),
    filterValue: React.PropTypes.string,
    setFilter: React.PropTypes.func.isRequired,
    loadLibUpdates: React.PropTypes.func.isRequired,
    searchLibrary: React.PropTypes.func.isRequired,
    showLibrary: React.PropTypes.func.isRequired,
    updateLibrary: React.PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadLibUpdates();
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
    items: getVisibleLibUpdates(state),
    filterValue: getUpdatesFilter(state),
    searchLibrary: (query, page) => goTo(ownProps.history, '/lib/registry/search', { query, page }),
    showLibrary: idOrManifest => goTo(ownProps.history, '/lib/installed/show', { idOrManifest })
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(LibraryUpdatesPage);
