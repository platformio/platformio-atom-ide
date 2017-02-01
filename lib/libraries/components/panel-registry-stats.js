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

import { BasePanel, EtchComponent } from '../../etch-component';
import LibRegistrySearchFormView from './registry-search-form-view';
import { dom as etchDom } from 'etch';
import relativeDate from 'relative-date';
import { runLibraryCommand } from '../util';

export default class LibRegistryStatsPanel extends BasePanel {

  onDidPanelShow() {
    runLibraryCommand('stats', null, '--json-output').then(
      data => this.refs.registryStats.update({
        data
      })
    );
  }

  render() {
    return (
      <div>
        <LibRegistryStatsView ref='registryStats' homebus={ this.props.homebus } />
      </div>
    );
  }

}

class LibRegistryStatsView extends EtchComponent {

  getKeywordBtnClassSize(index) {
    if (index < 10) {
      return 'lg';
    } else if (index < 20) {
      return 'default';
    } else if (index < 30) {
      return 'sm';
    }
    return 'xs';
  }

  onDidLibraryShow(id) {
    this.props.homebus.emit('lib-show', id);
  }

  onDidSearch(query) {
    this.props.homebus.emit('lib-search', {
      query
    });
  }

  onDidKeywordSearch(name) {
    return this.onDidSearch(`keyword:"${name}"`);
  }

  renderStats() {
    return (
      <div>
        <h2 className='block section-heading icon icon-history'>Recently</h2>
        <div className='row'>
          <div className='col-xs'>
            <h3 className='block section-heading icon icon-sync'>Updated</h3>
            <ul>
              { this.props.data.updated.map((item) => (
                  <li>
                    <a onclick={ () => this.onDidLibraryShow(item.id) }>
                      { item.name }
                    </a>
                    <small className='text-smaller' title={ item.date }> { relativeDate(new Date(item.date)) }</small>
                  </li>
                )) }
            </ul>
          </div>
          <div className='col-xs'>
            <h3 className='block section-heading icon icon-file-add'>Added</h3>
            <ul>
              { this.props.data.added.map((item) => (
                  <li>
                    <a onclick={ () => this.onDidLibraryShow(item.id) }>
                      { item.name }
                    </a>
                    <small className='text-smaller' title={ item.date }> { relativeDate(new Date(item.date)) }</small>
                  </li>
                )) }
            </ul>
          </div>
          <div className='col-xs'>
            <h3 className='block section-heading icon icon-tag'>Keywords</h3>
            <ul className='last-keywords'>
              { this.props.data.lastkeywords.map((name) => (
                  <li>
                    <button onclick={ () => this.onDidKeywordSearch(name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                      { name }
                    </button>
                  </li>
                )) }
            </ul>
          </div>
        </div>
        <h2 className='block section-heading icon icon-tag'>Popular Keywords</h2>
        <div className='block lib-keywords top-keywords'>
          { this.props.data.topkeywords.map((name, index) => (
              <button onclick={ () => this.onDidKeywordSearch(name) } className={ 'btn icon icon-tag inline-block-tight btn-' + this.getKeywordBtnClassSize(index) }>
                { name }
              </button>
            )) }
        </div>
        <h2 className='block section-heading icon icon-star'>Featured</h2>
        <div className='block row'>
          <div className='col-xs'>
            <h3 className='block section-heading icon icon-triangle-up'>Today</h3>
            <ul>
              { this.props.data.dlday.map((item) => (
                  <li>
                    <a onclick={ () => this.onDidLibraryShow(item.id) }>
                      { item.name }
                    </a>
                  </li>
                )) }
            </ul>
          </div>
          <div className='col-xs'>
            <h3 className='block section-heading icon icon-triangle-up'>Week</h3>
            <ul>
              { this.props.data.dlweek.map((item) => (
                  <li>
                    <a onclick={ () => this.onDidLibraryShow(item.id) }>
                      { item.name }
                    </a>
                  </li>
                )) }
            </ul>
          </div>
          <div className='col-xs'>
            <h3 className='block section-heading icon icon-triangle-up'>Month</h3>
            <ul>
              { this.props.data.dlmonth.map((item) => (
                  <li>
                    <a onclick={ () => this.onDidLibraryShow(item.id) }>
                      { item.name }
                    </a>
                  </li>
                )) }
            </ul>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='lib-stats'>
        <div className='row'>
          <div className='col-xs'>
            <h1 className='section-heading icon icon-book'>Statistics</h1>
          </div>
          <div className='col-xs text-right'>
            <button onclick={ () => this.onDidSearch('') } className='btn btn-info icon icon-code'>
              All Libraries
            </button>
          </div>
        </div>
        <LibRegistrySearchFormView homebus={ this.props.homebus } />
        <br />
        { this.props.data ? (
          this.renderStats()
          ) : (
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul>
          ) }
      </div>
    );
  }
}
