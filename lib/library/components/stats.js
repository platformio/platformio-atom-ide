/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import humanize from 'humanize';

export default class LibraryStats extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      added: PropTypes.array.isRequired,
      dlday: PropTypes.array.isRequired,
      dlmonth: PropTypes.array.isRequired,
      dlweek: PropTypes.array.isRequired,
      lastkeywords: PropTypes.array.isRequired,
      topkeywords: PropTypes.array.isRequired,
      updated: PropTypes.array.isRequired
    }),
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired
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
                  <li key={ item.name }>
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
                  <li key={ item.name }>
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
                  <li key={ name }>
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
              <button key={ name } onClick={ () => this.onDidKeywordSearch(name) } className={ 'btn icon icon-tag inline-block-tight btn-' + this.getKeywordBtnClassSize(index) }>
                { name }
              </button>
            )) }
        </div>
        <h2 className='block section-heading icon icon-star'>Trending</h2>
        <div className='block row'>
          <div className='col-xs'>
            <h3 className='block section-heading icon icon-triangle-up'>Today</h3>
            <ul>
              { this.props.data.dlday.map((item) => (
                  <li key={ item.name }>
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
                  <li key={ item.name }>
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
                  <li key={ item.name }>
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
