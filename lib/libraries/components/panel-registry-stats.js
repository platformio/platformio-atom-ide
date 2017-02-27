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

import { BasePanel, BaseView, jsxDOM } from '../../view';

import LibInstallAdvancedPrompt from './install-advanced-prompt';
import LibRegistrySearchFormView from './registry-search-form-view';
import humanize from 'humanize';
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

class LibRegistryStatsView extends BaseView {

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

  onDidInstall(event) {
    event.target.classList.add('btn-inprogress', 'disabled');
    new LibInstallAdvancedPrompt().prompt().then(lib => {
      this.props.homebus.emit(
        'lib-install', [
          lib,
          () => event.target.classList.remove('btn-inprogress', 'disabled')
        ]);
    }, () => {
      event.target.classList.remove('btn-inprogress', 'disabled');
    });
  }

  onDidRegister() {
    utils.openUrl('http://docs.platformio.org/page/librarymanager/creating.html');
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
                    <small className='text-smaller' title={ item.date }> { humanize.relativeTime(new Date(item.date).getTime() / 1000) }</small>
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
                    <small className='text-smaller' title={ item.date }> { humanize.relativeTime(new Date(item.date).getTime() / 1000) }</small>
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
            <div className='btn-group'>
              <button onclick={ () => this.onDidSearch('') } className='btn icon icon-code'>
                All Libraries
              </button>
              <button onclick={ () => this.onDidRegister() } className='btn icon icon-file-add'>
                Register
              </button>
              <button onclick={ (e) => this.onDidInstall(e) } className='btn icon icon-cloud-download'>
                Install
              </button>
            </div>
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
