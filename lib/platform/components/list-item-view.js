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

import * as utils from '../../utils';

import { BaseView, jsxDOM } from '../../view';


export default class PlatformListItemView extends BaseView {

  onDidReveal(event, item) {
    event.stopPropagation();
    if (item.__pkg_dir) {
      utils.revealFolder(item.__pkg_dir);
    }
  }

  onDidShow(event, item) {
    event.stopPropagation();
    this.props.homebus.emit('platform-show', item.version ? `${item.name}@${item.version}` : item);
  }

  onDidInstall(event, item) {
    event.stopPropagation();
    event.target.classList.add('btn-inprogress', 'disabled');
    this.props.homebus.emit(
      'platform-install', [
        item.name,
        () => event.target.classList.remove('btn-inprogress', 'disabled')
      ]);
  }

  onDidFramework(event, name) {
    event.stopPropagation();
    this.props.homebus.emit('framework-show', name);
  }

  render() {
    return (
      <div onclick={ (e) => this.onDidShow(e, this.props.item) } className='native-key-bindings block list-item-card' tabIndex='-1'>
        <div className='row'>
          <div className='col-xs-9'>
            <h2><a onclick={ (e) => this.onDidShow(e, this.props.item) }>{ this.props.item.title }</a></h2>
          </div>
          <div className='col-xs-3 text-right text-nowrap'>
            { this.props.item.version ? (
              <span><span className={ 'icon icon-' + (this.props.item.__src_url ? 'git-branch' : 'versions') }></span>
              { this.props.item.version }
              </span>
              ) : ('') }
          </div>
        </div>
        <div className='block'>
          { this.props.item.description }
        </div>
        <div className='row bottom-xs'>
          <div className='col-xs-7 tag-buttons'>
            { (this.props.item.frameworks ? this.props.item.frameworks : []).map(item => (
                <button onclick={ (e) => this.onDidFramework(e, item.name) } className='btn btn-sm icon icon-gear inline-block-tight'>
                  { item.title }
                </button>
              )) }
          </div>
          <div className='col-xs-5 text-right card-actions'>
            <div className='btn-group'>
              { this.props.actions.includes('reveal') ? (
                <button onclick={ (e) => this.onDidReveal(e, this.props.item) } className='btn btn-primary icon icon-file-directory'>
                  Reveal
                </button>
                ) : ('') }
              { this.props.actions.includes('install') ? (
                <button onclick={ (e) => this.onDidInstall(e, this.props.item) } className='btn btn-primary icon icon-cloud-download'>
                  Install
                </button>
                ) : ('') }
              { this.props.onuninstall && this.props.actions.includes('uninstall') ? (
                <button onclick={ (e) => this.props.onuninstall(e) } className='btn btn-primary icon icon-trashcan'>
                  Uninstall
                </button>
                ) : ('') }
              { this.props.onupdate && this.props.actions.includes('update') ? (
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
