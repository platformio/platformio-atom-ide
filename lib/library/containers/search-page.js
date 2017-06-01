/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import LibrarySearchCard from '../components/search-card';
import LibrarySearchForm from '../components/search-form';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getSearchResult } from '../selectors';
import { goTo } from '../../core/helpers';


class LibrarySearchPage extends React.Component {

  static propTypes = {
    result: PropTypes.shape({
      items: PropTypes.array.isRequired,
      total: PropTypes.number.isRequired,
      page: PropTypes.number.isRequired,
      perpage: PropTypes.number.isRequired
    }),
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    loadSearchResult: PropTypes.func.isRequired,
    installLibrary: PropTypes.func.isRequired,
    searchQuery: PropTypes.string.isRequired,
    searchPage: PropTypes.number.isRequired
  }

  static STATUS = {
    LOADING: 0,
    LOADING_MORE: 1,
    NORESULTS: 2,
    LOADED: 3
  }

  constructor() {
    super(...arguments);
    this._moreItems = [];
  }

  componentWillMount() {
    this.props.loadSearchResult(this.props.searchQuery);
  }

  componentWillReceiveProps(nextProps) {
    const queryChanged = this.props.searchQuery !== nextProps.searchQuery;
    if (queryChanged || this.props.searchPage !== nextProps.searchPage) {
      if (queryChanged || !nextProps.searchPage) {
        this._moreItems = [];
      }
      this.props.loadSearchResult(nextProps.searchQuery, nextProps.searchPage);
    }
  }

  onDidMoreResults() {
    this._moreItems = this._moreItems.concat(this.props.result.items);
    this.props.searchLibrary(
      this.props.searchQuery,
      this.props.result.page + 1
    );
  }

  hasMoreResults() {
    if (this.getStatus() === LibrarySearchPage.STATUS.LOADING_MORE) {
      return true;
    } else if (!this.props.result) {
      return false;
    }
    return (this.props.result.page * this.props.result.perpage) < this.props.result.total;
  }

  getStatus() {
    if (!this.props.result && this._moreItems.length) {
      return LibrarySearchPage.STATUS.LOADING_MORE;
    } else if (!this.props.result) {
      return LibrarySearchPage.STATUS.LOADING;
    } else if (this.props.result.items.length === 0) {
      return LibrarySearchPage.STATUS.NORESULTS;
    }
    return LibrarySearchPage.STATUS.LOADED;
  }

  getTotalResults() {
    if (this.props.result) {
      return this.props.result.total;
    }
    return -1;
  }

  render() {
    const status = this.getStatus();
    const totalResults = this.getTotalResults();

    let items = this.props.result ? this.props.result.items : [];
    if (this._moreItems.length) {
      items = this._moreItems.concat(items);
    }

    return (
      <div className='lib-search'>
        <h1 className='section-heading icon icon-book'>Search <span className='badge badge-medium'>{ totalResults > -1 ? totalResults.toLocaleString() : '' }</span></h1>
        <LibrarySearchForm searchLibrary={ this.props.searchLibrary } defaultSearch={ this.props.searchQuery } />
        <br />
        { status === LibrarySearchPage.STATUS.LOADING &&
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul> }
        { status === LibrarySearchPage.STATUS.NORESULTS &&
          <ul className='background-message text-center'>
            <li>
              No Results
            </li>
          </ul> }
        <div className='block'>
          { items.map(item => (
              <LibrarySearchCard item={ item }
                searchLibrary={ this.props.searchLibrary }
                showLibrary={ this.props.showLibrary }
                installLibrary={ this.props.installLibrary } />
            )) }
        </div>
        { this.hasMoreResults() &&
          <div className='block text-center'>
            <button onClick={ ::this.onDidMoreResults } className={ 'btn icon icon-move-down ' + (status === LibrarySearchPage.STATUS.LOADING_MORE ? 'btn-primary btn-inprogress' : 'btn-default') }>
              More...
            </button>
          </div> }
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    result: getSearchResult(state, ownProps.location.state.query, ownProps.location.state.page),
    searchQuery: ownProps.location.state.query,
    searchPage: ownProps.location.state.page,
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(LibrarySearchPage);
