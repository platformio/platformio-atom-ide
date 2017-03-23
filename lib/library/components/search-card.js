/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { CompositeDisposable } from 'atom';
import React from 'react';


export default class LibrarySearchCard extends React.Component {

  static propTypes = {
    item: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      name: React.PropTypes.string.isRequired,
      description: React.PropTypes.string.isRequired,
      examplenums: React.PropTypes.number.isRequired,
      dlmonth: React.PropTypes.number.isRequired,
      keywords: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
      authornames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
    }),
    searchLibrary: React.PropTypes.func.isRequired,
    showLibrary: React.PropTypes.func.isRequired,
    installLibrary: React.PropTypes.func.isRequired
  }

  componentDidMount() {
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

  componentWillUnmount() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
  }

  onDidShow(event, id) {
    event.stopPropagation();
    this.props.showLibrary(id);
  }

  onDidInstall(event, id) {
    event.stopPropagation();
    const button = event.target;
    button.classList.add('btn-inprogress', 'disabled');
    this.props.installLibrary(
      id,
      () => button.classList.remove('btn-inprogress', 'disabled')
    );
  }

  onDidKeywordSearch(event, name) {
    event.stopPropagation();
    this.props.searchLibrary(`keyword:"${name}"`);
  }

  render() {
    return (
      <div onClick={ (e) => this.onDidShow(e, this.props.item.id) } className='block list-item-card'>
        <div className='row'>
          <div className='col-xs-10'>
            <h2><a onClick={ (e) => this.onDidShow(e, this.props.item.id) }>{ this.props.item.name }</a> <small>by { this.props.item.authornames.join(', ') }</small></h2>
          </div>
          <div className='col-xs-2 text-right'>
            <ul className='list-inline text-nowrap'>
              <li ref='exampleNums'>
                <span className='icon icon-mortar-board'></span>
                { this.props.item.examplenums }
              </li>
              <li ref='downloadNums'>
                <span className='icon icon-cloud-download'></span>
                { this.props.item.dlmonth.toLocaleString() }
              </li>
            </ul>
          </div>
        </div>
        <div className='block'>
          { this.props.item.description }
        </div>
        <div className='row'>
          <div className='col-xs-10 tag-buttons'>
            { this.props.item.keywords.map(name => (
                <button onClick={ (e) => this.onDidKeywordSearch(e, name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { name }
                </button>
              )) }
          </div>
          <div className='col-xs-2 text-right card-actions'>
            <button onClick={ (e) => this.onDidInstall(e, this.props.item.id) } className='btn btn btn-primary icon icon-cloud-download'>
              Install
            </button>
          </div>
        </div>
      </div>
    );
  }

}
