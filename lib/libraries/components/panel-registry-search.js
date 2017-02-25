/** @babel */
/** @jsx etchDom */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import { BasePanel, EtchComponent } from '../../view';
import { CompositeDisposable } from 'atom';
import LibRegistrySearchFormView from './registry-search-form-view';
import { dom as etchDom } from 'etch';
import { runLibraryCommand } from '../util';

export default class LibRegistrySearchPanel extends BasePanel {

  loadResult(query, page = 1) {
    runLibraryCommand('search', null, query, '--page', page, '--json-output').then(
      data => this.refs.registrySearch.update({
        data
      }));
  }

  update(props) {
    super.update(props);
    if (!props.hasOwnProperty('query')) {
      return;
    }

    if (props.hasOwnProperty('page')) {
      this.loadResult(props.query, props.page);
    } else {
      this.refs.registrySearch.update({
        data: null
      }); // reset previous view
      this.loadResult(props.query);
    }
  }

  render() {
    return (
      <div>
        <LibRegistrySearchView ref='registrySearch' homebus={ this.props.homebus } query={ this.props.query ? this.props.query : '' } />
      </div>
    );
  }
}

class LibRegistrySearchView extends EtchComponent {

  static STATUS = {
    LOADING: 0,
    NORESULTS: 1,
    LOADED: 2
  }

  constructor() {
    super(...arguments);
    this._prevItems = null;
  }

  update(props) {
    if (this._prevItems && props.data) {
      props.data.items = [...this._prevItems, ...props.data.items];
      this._prevItems = null;
    }
    super.update(props);
    this.refs.libSearchForm.update({
      query: this.props.query
    });
  }

  onDidMoreResults() {
    this._prevItems = this.props.data.items;
    this.props.homebus.emit(
      'lib-search', {
        query: this.props.query,
        page: this.props.data.page + 1
      });
  }

  getStatus() {
    if (!this.props.data) {
      return LibRegistrySearchView.STATUS.LOADING;
    } else if (this.props.data.items.length === 0) {
      return LibRegistrySearchView.STATUS.NORESULTS;
    }
    return LibRegistrySearchView.STATUS.LOADED;
  }

  isStatus(status) {
    return this.getStatus() === status;
  }

  getTotalResults() {
    if (this.props.data) {
      return this.props.data.total;
    }
    return -1;
  }

  hasMoreResults() {
    if (!this.props.data || !this.isStatus(LibRegistrySearchView.STATUS.LOADED)) {
      return false;
    }
    return (this.props.data.page * this.props.data.perpage) < this.props.data.total;
  }

  render() {
    const totalResults = this.getTotalResults();
    return (
      <div className='lib-search'>
        <h1 className='section-heading icon icon-book'>Search <span className='badge badge-medium'>{ totalResults > -1? totalResults.toLocaleString() : '' }</span></h1>
        <LibRegistrySearchFormView ref='libSearchForm' homebus={ this.props.homebus } />
        <br />
        { this.isStatus(LibRegistrySearchView.STATUS.LOADING) ? (
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul>
          ) : ('') }
        { this.isStatus(LibRegistrySearchView.STATUS.NORESULTS) ? (
          <ul className='background-message text-center'>
            <li>
              No Results
            </li>
          </ul>
          ) : ('') }
        <div className='block'>
          { (this.props.data ? this.props.data.items : []).map(item => <LibSearchResultItem homebus={ this.props.homebus } data={ item } />
            ) }
        </div>
        { this.hasMoreResults() ? (
          <div className='block text-center'>
            <button onclick={ () => this.onDidMoreResults() } className='btn btn btn-default icon icon-move-down'>
              More...
            </button>
          </div>
          ) : ('') }
      </div>
    );
  }
}

class LibSearchResultItem extends EtchComponent {

  constructor(props) {
    super(props);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.tooltips.add(
      this.refs.exampleNums, {
        title: 'Total examples'
      }));
    this.subscriptions.add(atom.tooltips.add(
      this.refs.downloadNums, {
        title: 'Unique downloads per month'
      }));
  }

  onDidShow(event, id) {
    event.stopPropagation();
    this.props.homebus.emit('lib-show', id);
  }

  onDidInstall(event, id) {
    event.stopPropagation();
    event.target.classList.add('btn-inprogress', 'disabled');
    this.props.homebus.emit(
      'lib-install', [
        id,
        () => event.target.classList.remove('btn-inprogress', 'disabled')
      ]);
  }

  onDidKeywordSearch(event, name) {
    event.stopPropagation();
    this.props.homebus.emit('lib-search', {
      query: `keyword:"${name}"`
    });
  }

  destroy() {
    this.subscriptions.dispose();
    super.destroy();
  }

  render() {
    return (
      <div onclick={ (e) => this.onDidShow(e, this.props.data.id) } className='block lib-summary-block'>
        <div className='row'>
          <div className='col-xs-10'>
            <h2><a onclick={ (e) => this.onDidShow(e, this.props.data.id) }>{ this.props.data.name }</a> <small>by { this.props.data.authornames.join(', ') }</small></h2>
          </div>
          <div className='col-xs-2 text-right'>
            <ul className='list-inline text-nowrap'>
              <li ref='exampleNums'>
                <span className='icon icon-mortar-board'></span>
                { this.props.data.examplenums }
              </li>
              <li ref='downloadNums'>
                <span className='icon icon-cloud-download'></span>
                { this.props.data.dlmonth.toLocaleString() }
              </li>
            </ul>
          </div>
        </div>
        <div className='block'>
          { this.props.data.description }
        </div>
        <div className='row'>
          <div className='col-xs-10 lib-keywords'>
            { this.props.data.keywords.map(name => (
                <button onclick={ (e) => this.onDidKeywordSearch(e, name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { name }
                </button>
              )) }
          </div>
          <div className='col-xs-2 text-right lib-action'>
            <button onclick={ (e) => this.onDidInstall(e, this.props.data.id) } className='btn btn btn-primary icon icon-cloud-download'>
              Install
            </button>
          </div>
        </div>
      </div>
    );
  }

}
