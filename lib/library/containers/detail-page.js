/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
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
import PropTypes from 'prop-types';
import React from 'react';
import SubPages from '../../home/components/subpages';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getLibraryData } from '../selectors';
import { goTo } from '../../core/helpers';


class LibraryDetailPage extends React.Component {

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    data: PropTypes.object,
    idOrManifest: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object
    ]),
    loadLibraryData: PropTypes.func.isRequired,
    installLibrary: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired
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
