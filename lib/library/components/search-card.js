/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { CompositeDisposable } from 'atom';
import PropTypes from 'prop-types';
import React from 'react';


export default class LibrarySearchCard extends React.Component {

  static propTypes = {
    item: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      examplenums: PropTypes.number.isRequired,
      dlmonth: PropTypes.number.isRequired,
      keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
      authornames: PropTypes.arrayOf(PropTypes.string).isRequired
    }),
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    installLibrary: PropTypes.func.isRequired
  }

  componentDidMount() {
    if (!this.exampleNumsElement || !this.downloadNumsElement) {
      return;
    }
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.tooltips.add(
      this.exampleNumsElement, {
        title: 'Total examples'
      }));
    this.subscriptions.add(atom.tooltips.add(
      this.downloadNumsElement, {
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
              <li ref={ item => this.exampleNumsElement = item }>
                <span className='icon icon-mortar-board'></span>
                { this.props.item.examplenums }
              </li>
              <li ref={ item => this.downloadNumsElement = item }>
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
          <div className='col-xs-10 inline-buttons'>
            { this.props.item.keywords.map(name => (
                <button key={ name } onClick={ (e) => this.onDidKeywordSearch(e, name) } className='btn btn-sm icon icon-tag inline-block-tight'>
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
