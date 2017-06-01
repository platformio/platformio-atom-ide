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

import LibraryInstallAdvancedModal from './install-advanced-modal';
import LibrarySearchForm from '../components/search-form';
import LibraryStats from '../components/stats';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getStats } from '../selectors';
import { goTo } from '../../core/helpers';


class LibraryStatsPage extends React.Component {

  static propTypes = {
    data: PropTypes.object,
    loadStats: PropTypes.func.isRequired,
    installLibrary: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadStats();
    this._reloadTimer = setInterval(() => this.props.loadStats(true), 3600 * 1000);
  }

  componentWillUnmount() {
    if (this._reloadTimer) {
      clearInterval(this._reloadTimer);
    }
  }

  onDidRegister() {
    utils.openUrl('http://docs.platformio.org/page/librarymanager/creating.html');
  }

  async onDidAdvanced(event) {
    event.stopPropagation();
    const button = event.target;
    button.classList.add('btn-inprogress', 'disabled');
    try {
      this.props.installLibrary(
        await (new LibraryInstallAdvancedModal().open()),
        () => button.classList.remove('btn-inprogress', 'disabled')
      );
    } catch (err) {
      if (err) {
        console.error(err);
      }
      button.classList.remove('btn-inprogress', 'disabled');
    }
  }

  render() {
    return (
      <div className='lib-stats'>
        <div className='row'>
          <div className='col-xs'>
            <h1 className='section-heading icon icon-book'>Statistics</h1>
          </div>
          <div className='col-xs text-right'>
            <div className='btn-group'>
              <button onClick={ () => this.props.searchLibrary('') } className='btn btn-primary icon icon-code'>
                All Libraries
              </button>
              <button onClick={ () => this.onDidRegister() } className='btn btn-primary icon icon-file-add'>
                Register
              </button>
              <button ref='advancedButton' onClick={ (e) => this.onDidAdvanced(e) } className='btn btn-primary icon icon-cloud-download'>
                Advanced
              </button>
            </div>
          </div>
        </div>
        <LibrarySearchForm searchLibrary={ this.props.searchLibrary } />
        <br />
        { this.props.data ? (
          <LibraryStats data={ this.props.data } searchLibrary={ this.props.searchLibrary } showLibrary={ this.props.showLibrary }  />
          ) : (
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul> ) }
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    data: getStats(state),
    searchLibrary: (query, page) => goTo(ownProps.history, '/lib/registry/search', { query, page }),
    showLibrary: idOrManifest => goTo(ownProps.history, '/lib/registry/show', { idOrManifest })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(LibraryStatsPage);
