/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import humanize from 'humanize';

export default class LibraryStats extends React.Component {

  static propTypes = {
    data: React.PropTypes.shape({
      added: React.PropTypes.array.isRequired,
      dlday: React.PropTypes.array.isRequired,
      dlmonth: React.PropTypes.array.isRequired,
      dlweek: React.PropTypes.array.isRequired,
      lastkeywords: React.PropTypes.array.isRequired,
      topkeywords: React.PropTypes.array.isRequired,
      updated: React.PropTypes.array.isRequired
    }),
    searchLibrary: React.PropTypes.func.isRequired,
    showLibrary: React.PropTypes.func.isRequired
  }

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

  onDidKeywordSearch(name) {
    return this.props.searchLibrary(`keyword:"${name}"`);
  }

  render() {
    return (
      <div>
        <h2 className='block section-heading icon icon-history'>Recently</h2>
        <div className='row'>
          <div className='col-xs'>
            <h3 className='block section-heading icon icon-sync'>Updated</h3>
            <ul>
              { this.props.data.updated.map((item) => (
                  <li>
                    <a onClick={ () => this.props.showLibrary(item.id) }>
                      { item.name }
                    </a>
                    <small className='text-smaller' title={ item.date }>{ ' ' + humanize.relativeTime(new Date(item.date).getTime() / 1000) }</small>
                  </li>
                )) }
            </ul>
          </div>
          <div className='col-xs'>
            <h3 className='block section-heading icon icon-file-add'>Added</h3>
            <ul>
              { this.props.data.added.map((item) => (
                  <li>
                    <a onClick={ () => this.props.showLibrary(item.id) }>
                      { item.name }
                    </a>
                    <small className='text-smaller' title={ item.date }>{ ' ' + humanize.relativeTime(new Date(item.date).getTime() / 1000) }</small>
                  </li>
                )) }
            </ul>
          </div>
          <div className='col-xs'>
            <h3 className='block section-heading icon icon-tag'>Keywords</h3>
            <ul className='last-keywords'>
              { this.props.data.lastkeywords.map((name) => (
                  <li>
                    <button onClick={ () => this.onDidKeywordSearch(name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                      { name }
                    </button>
                  </li>
                )) }
            </ul>
          </div>
        </div>
        <h2 className='block section-heading icon icon-tag'>Popular Keywords</h2>
        <div className='block inline-buttons top-keywords'>
          { this.props.data.topkeywords.map((name, index) => (
              <button onClick={ () => this.onDidKeywordSearch(name) } className={ 'btn icon icon-tag inline-block-tight btn-' + this.getKeywordBtnClassSize(index) }>
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
                    <a onClick={ () => this.props.showLibrary(item.id) }>
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
                    <a onClick={ () => this.props.showLibrary(item.id) }>
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
                    <a onClick={ () => this.props.showLibrary(item.id) }>
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

}
