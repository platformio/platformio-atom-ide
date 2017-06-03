/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { INPUT_FILTER_KEY, getFilter, getVisibleProjects } from '../selectors';

import { CompositeDisposable } from 'atom';
import { INPUT_FILTER_DELAY } from '../../config';
import ProjectsBlock from '../components/projects-block';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { lazyUpdateInputValue } from '../../core/actions';


class RecentProjectsBlock extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.string),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadProjects: PropTypes.func.isRequired,
    syncProjects: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    removeProject: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadProjects();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.project.onDidChangePaths(items => {
      this.props.syncProjects(items);
    }));
  }

  componentWillUnmount() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
      this.subscriptions = null;
    }
  }

  render() {
    return (
      <ProjectsBlock {...this.props} />
    );
  }

}

// Redux

function mapStateToProps(state) {
  return {
    items: getVisibleProjects(state),
    filterValue: getFilter(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    setFilter: value => dispatch(lazyUpdateInputValue(INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RecentProjectsBlock);
