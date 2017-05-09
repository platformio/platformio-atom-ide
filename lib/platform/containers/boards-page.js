/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';
import { BOARDS_INPUT_FILTER_KEY, getBoardsFilter, getVisibleBoards } from '../selectors';

import Boards from '../components/boards';
import { INPUT_FILTER_DELAY } from '../../config';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../home/helpers';
import { lazyUpdateInputValue } from '../../core/actions';


class BoardsPage extends React.Component {

  static propTypes = {
    items: React.PropTypes.arrayOf(React.PropTypes.object),
    storageFilterValue: React.PropTypes.string.isRequired,
    setStorageFilter: React.PropTypes.func.isRequired,
    filterValue: React.PropTypes.string.isRequired,
    setFilter: React.PropTypes.func.isRequired,
    loadBoards: React.PropTypes.func.isRequired,
    showPlatform: React.PropTypes.func.isRequired,
    showFramework: React.PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadBoards();
  }

  render() {
    return (
      <section className='page-container-fluid boards-page'>
        <Boards
          items={ this.props.items }
          header='Board Explorer'
          defaultFilter={ this.props.filterValue }
          onFilter={ this.props.setFilter }
          showPlatform={ this.props.showPlatform }
          showFramework={ this.props.showFramework } />
      </section>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: getVisibleBoards(state),
    filterValue: getBoardsFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platform/embedded/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platform/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    setFilter: value => dispatch(lazyUpdateInputValue(BOARDS_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(BoardsPage);
