/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';
import * as utils from '../../utils';

import LibraryDetailExamplesBlock from '../containers/detail-examples-block';
import LibraryDetailHeadersBlock from '../containers/detail-headers-block';
import LibraryDetailInstallationBlock from '../containers/detail-installation-block';
import LibraryDetailMain from '../components/detail-main';
import LibraryDetailManifestBlock from '../containers/detail-manifest-block';
import React from 'react';
import SubPages from '../../home/components/subpages';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getLibraryData } from '../selectors';
import { goTo } from '../../home/helpers';


class LibraryDetailPage extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  static propTypes = {
    data: React.PropTypes.object,
    idOrManifest: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.object
    ]),
    loadLibraryData: React.PropTypes.func.isRequired,
    installLibrary: React.PropTypes.func.isRequired,
    searchLibrary: React.PropTypes.func.isRequired,
    showLibrary: React.PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadLibraryData(this.props.idOrManifest);
  }

  getRoutes() {
    const root = this.context.router.route.match.path;
    const pathState = { idOrManifest: this.props.idOrManifest };
    return [
      {
        path: root,
        pathState,
        icon: 'mortar-board',
        label: 'Examples',
        component: <LibraryDetailExamplesBlock data={ this.props.data } />
      },
      {
        path: `${root}/installation`,
        pathState,
        icon: 'cloud-download',
        label: 'Installation',
        component: <LibraryDetailInstallationBlock data={ this.props.data } installLibrary={ this.props.installLibrary } />
      },
      {
        path: `${root}/headers`,
        pathState,
        icon: 'file-code',
        label: 'Headers',
        component: <LibraryDetailHeadersBlock data={ this.props.data } />
      },
      {
        path: `${root}/manifest`,
        pathState,
        icon: 'pencil',
        label: 'Manifest',
        component: <LibraryDetailManifestBlock data={ this.props.data } />
      }
    ];
  }

  onDidDiscussionOpen() {
    let url = 'https://community.platformio.org';
    if (this.props.data.id && this.props.data.name) {
      url = `http://platformio.org/lib/show/${this.props.data.id}/${this.props.data.name}/discussion`;
    }
    utils.openUrl(url);
  }

  render() {
    return (
      <div className='lib-detail native-key-bindings' tabIndex='-1'>
        <LibraryDetailMain data={ this.props.data } searchLibrary={ this.props.searchLibrary } />
        { this.props.data && <SubPages routes={ this.getRoutes() } /> }
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  const idOrManifest = ownProps.location.state.idOrManifest;
  return {
    data: getLibraryData(state, idOrManifest),
    idOrManifest,
    searchLibrary: (query, page) => goTo(ownProps.history, '/lib/registry/search', { query, page })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(LibraryDetailPage);
