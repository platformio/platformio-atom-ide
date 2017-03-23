/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { LibraryStorage } from '../storage';
import React from 'react';


export default class LibraryStorageItem extends React.Component {

  static propTypes = {
    item: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      version: React.PropTypes.string.isRequired,
      versionLatest: React.PropTypes.string,
      description: React.PropTypes.string,
      url: React.PropTypes.string,
      keywords: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
      authors: React.PropTypes.arrayOf(React.PropTypes.object),
      __src_url: React.PropTypes.string.isRequired,
    }),
    onShow: React.PropTypes.func.isRequired,
    onReveal: React.PropTypes.func.isRequired,
    onUninstall: React.PropTypes.func.isRequired,
    onUpdate: React.PropTypes.func.isRequired,
    onSearch: React.PropTypes.func.isRequired,
    actions: React.PropTypes.number.isRequired
  }

  getAuthorNames() {
    if (!this.props.item.authors) {
      return [];
    }
    return this.props.item.authors.map(item => item.name);
  }

  onDidShow(event, item) {
    event.stopPropagation();
    this.props.onShow(item);
  }

  onDidKeywordSearch(event, name) {
    event.stopPropagation();
    this.props.onSearch(`keyword:"${name}"`);
  }

  render() {
    const authornames = this.getAuthorNames();
    return (
      <div onClick={ (e) => this.onDidShow(e, this.props.item) }
        className='block list-item-card native-key-bindings'
        tabIndex='-1'>
        <div className='row'>
          <div className='col-xs-9'>
            <h2><a onClick={ (e) => this.onDidShow(e, this.props.item) }>{ this.props.item.name }</a> <small>{ authornames.length ? ` by ${authornames.join(', ')}` : '' }</small></h2>
          </div>
          <div className='col-xs-3 text-right text-nowrap'>
            <span className={ 'icon icon-' + (this.props.item.__src_url ? 'git-branch' : 'versions') }></span>
            { this.props.item.version }
          </div>
        </div>
        <div className='block'>
          { this.props.item.description || this.props.item.url }
        </div>
        <div className='row bottom-xs'>
          <div className='col-xs-7 tag-buttons'>
            { (this.props.item.keywords || []).map(name => (
                <button onClick={ (e) => this.onDidKeywordSearch(e, name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { name }
                </button>
              )) }
          </div>
          <div className='col-xs-5 text-right card-actions'>
            <div className='btn-group'>
              { this.props.onReveal && this.props.actions & LibraryStorage.ACTION_REVEAL ? (
                <button onClick={ (e) => this.props.onReveal(e) } className='btn btn-primary icon icon-file-directory'>
                  Reveal
                </button>
                ) : ('') }
              { this.props.onUninstall && this.props.actions & LibraryStorage.ACTION_UNINSTALL ? (
                <button onClick={ (e) => this.props.onUninstall(e) } className='btn btn-primary icon icon-trashcan'>
                  Uninstall
                </button>
                ) : ('') }
              { this.props.onUpdate && this.props.actions & LibraryStorage.ACTION_UPDATE ? (
                <button onClick={ (e) => this.props.onUpdate(e) } className='btn btn-primary icon icon-cloud-download'>
                  { this.props.item.versionLatest ? `Update to ${this.props.item.versionLatest}` : 'Update' }
                </button>
                ) : ('') }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
