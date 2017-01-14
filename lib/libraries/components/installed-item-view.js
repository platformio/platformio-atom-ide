/** @babel */
/** @jsx etchDom */

/**
 * Copyright 2016-present Ivan Kravets <me@ikravets.com>
 *
 * This source file is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import * as utils from '../../utils';

import { EtchComponent } from '../../etch-component';
import { dom as etchDom } from 'etch';

export default class LibInstalledItemView extends EtchComponent {

  onDidShow(event, id) {
    event.stopPropagation();
    if (id) {
      this.props.homebus.emit('lib-show', id);
    }
  }

  onDidUninstall(event) {
    event.stopPropagation();
    this.props.onuninstall();
  }

  onDidReveal(event) {
    event.stopPropagation();
    if (this.props.data.__pkg_dir) {
      utils.revealFolder(this.props.data.__pkg_dir);
    }
  }

  onDidKeywordSearch(event, name) {
    event.stopPropagation();
    this.props.homebus.emit('lib-search', {
      query: `keyword:"${name}"`
    });
  }

  getAuthorNames() {
    const items = [];
    if (this.props.data.authors) {
      this.props.data.authors.map(item => items.push(item.name));
    }
    return items;
  }

  render() {
    const authornames = this.getAuthorNames();
    return (
      <div onclick={ (e) => this.onDidShow(e, this.props.data.id) }
        className='block lib-summary-block native-key-bindings'
        tabIndex={ -1 }
        style={ { cursor: this.props.data.id ? 'pointer' : 'default' } }>
        <div className='row'>
          <div className='col-xs-9'>
            <h2>{ this.props.data.id ? (
                  <a onclick={ (e) => this.onDidShow(e, this.props.data.id) }>
                    { this.props.data.name }
                  </a>
                  ) : (
                  <span>{ this.props.data.name }</span>
                  ) } <small>{ authornames.length ? ` by ${authornames.join(', ')}` : '' }</small></h2>
          </div>
          <div className='col-xs-3 text-right text-nowrap'>
            <span className='icon icon-versions'></span>
            { this.props.data.version }
          </div>
        </div>
        <div className='block'>
          { this.props.data.description ? this.props.data.description : this.props.data.url }
        </div>
        <div className='row bottom-xs'>
          <div className='col-xs-7 lib-keywords'>
            { (this.props.data.keywords ? this.props.data.keywords : []).map(name => (
                <button onclick={ (e) => this.onDidKeywordSearch(e, name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { name }
                </button>
              )) }
          </div>
          <div className='col-xs-5 text-right lib-action'>
            <div className='btn-group'>
              <button onclick={ (e) => this.onDidReveal(e) } className='btn btn-primary icon icon-file-directory'>
                Reveal
              </button>
              { this.props.onuninstall ? (
                <button onclick={ (e) => this.onDidUninstall(e) } className='btn btn-primary icon icon-trashcan'>
                  Uninstall
                </button>
                ) : ('') }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
