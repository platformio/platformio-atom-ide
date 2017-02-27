/** @babel */
/** @jsx jsxDOM */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import { BaseView, jsxDOM } from '../../view';

import { LibStorageItem } from '../util';


export default class LibListItemView extends BaseView {

  getAuthorNames() {
    if (!this.props.item.authors) {
      return [];
    }
    return this.props.item.authors.map(item => item.name);
  }

  onDidShow(event, item) {
    event.stopPropagation();
    this.props.homebus.emit('lib-show', item);
  }

  onDidKeywordSearch(event, name) {
    event.stopPropagation();
    this.props.homebus.emit('lib-search', {
      query: `keyword:"${name}"`
    });
  }

  render() {
    const authornames = this.getAuthorNames();
    return (
      <div onclick={ (e) => this.onDidShow(e, this.props.item) }
        className='block lib-card native-key-bindings'
        tabIndex={ -1 }>
        <div className='row'>
          <div className='col-xs-9'>
            <h2><a onclick={ (e) => this.onDidShow(e, this.props.item) }>{ this.props.item.name }</a> <small>{ authornames.length ? ` by ${authornames.join(', ')}` : '' }</small></h2>
          </div>
          <div className='col-xs-3 text-right text-nowrap'>
            <span className='icon icon-versions'></span>
            { this.props.item.version }
          </div>
        </div>
        <div className='block'>
          { this.props.item.description ? this.props.item.description : this.props.item.url }
        </div>
        <div className='row bottom-xs'>
          <div className='col-xs-7 lib-keywords'>
            { (this.props.item.keywords ? this.props.item.keywords : []).map(name => (
                <button onclick={ (e) => this.onDidKeywordSearch(e, name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { name }
                </button>
              )) }
          </div>
          <div className='col-xs-5 text-right lib-action'>
            <div className='btn-group'>
              { this.props.onreveal && this.props.actions & LibStorageItem.ACTION_REVEAL ? (
                <button onclick={ (e) => this.props.onreveal(e) } className='btn btn-primary icon icon-file-directory'>
                  Reveal
                </button>
                ) : ('') }
              { this.props.onuninstall && this.props.actions & LibStorageItem.ACTION_UNINSTALL ? (
                <button onclick={ (e) => this.props.onuninstall(e) } className='btn btn-primary icon icon-trashcan'>
                  Uninstall
                </button>
                ) : ('') }
              { this.props.onupdate && this.props.actions & LibStorageItem.ACTION_UPDATE ? (
                <button onclick={ (e) => this.props.onupdate(e) } className='btn btn-primary icon icon-cloud-download'>
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
