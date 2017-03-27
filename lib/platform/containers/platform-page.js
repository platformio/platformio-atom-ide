/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import Boards from '../components/boards';
import PlatformDetailMain from '../components/platform-main';
import PlatformDetailPackages from '../components/platform-packages';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getPlatformData } from '../selectors';
import { goTo } from '../../home/helpers';


class PlatformDetailPage extends React.Component {

  static propTypes = {
    name: React.PropTypes.string.isRequired,
    data: React.PropTypes.object,
    loadPlatformData: React.PropTypes.func.isRequired,
    showPlatform: React.PropTypes.func.isRequired,
    showFramework: React.PropTypes.func.isRequired,
    installPlatform: React.PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadPlatformData(this.props.name);
  }

  render() {
    if (!this.props.data) {
      return (
        <ul className='background-message text-center'>
          <li>
            <span className='loading loading-spinner-small inline-block'></span> Loading...
          </li>
        </ul>
      );
    }
    return (
      <div className='platform-detail native-key-bindings' tabIndex='-1'>
        <PlatformDetailMain { ...this.props } />
        <PlatformDetailPackages items={ this.props.data.packages } />
        { (!this.props.data.boards || this.props.data.boards.length > 0) && (
          <Boards items={ this.props.data.boards }
            header='Boards'
            headerSize={ 2 }
            showPlatform={ this.props.showPlatform }
            showFramework={ this.props.showFramework } />
        )}
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  const name = ownProps.location.state.name;
  return {
    name,
    data: getPlatformData(state, name),
    showPlatform: name => goTo(ownProps.history, '/platform/embedded/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platform/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PlatformDetailPage);
