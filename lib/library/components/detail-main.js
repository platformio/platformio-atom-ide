/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';

import React from 'react';
import humanize from 'humanize';


export default class LibraryDetailMain extends React.Component {

  static propTypes = {
    data: React.PropTypes.shape({
      id: React.PropTypes.number,
      name: React.PropTypes.string.isRequired,
      description: React.PropTypes.string.isRequired,
      homepage: React.PropTypes.string,
      repository: React.PropTypes.string,
      keywords: React.PropTypes.array.isRequired,
      authors: React.PropTypes.array.isRequired,
      platforms: React.PropTypes.array,
      frameworks: React.PropTypes.array,
      dlstats: React.PropTypes.object,
      version: React.PropTypes.object,
      __src_url: React.PropTypes.string,
      __pkg_dir: React.PropTypes.string
    }),
    searchLibrary: React.PropTypes.func.isRequired
  }

  getAuthorNames() {
    return this.props.data.authors.map(item => item.name);
  }

  onDidAuthorSearch(name) {
    this.props.searchLibrary(`author:"${name}"`);
  }

  onDidFrameworkSearch(name) {
    this.props.searchLibrary(`framework:${name}`);
  }

  onDidPlatformSearch(name) {
    this.props.searchLibrary(`platform:${name}`);
  }

  onDidKeywordSearch(name) {
    this.props.searchLibrary(`keyword:"${name}"`);
  }

  onDidEmail(email) {
    utils.openUrl(`mailto:${email}`);
  }

  onDidReveal(dir) {
    utils.revealFolder(dir);
  }

  render() {
    if (!this.props.data) {
      return (
        <ul className='background-message text-center'>
          <li>
            <span className='loading loading-spinner-small inline-block'></span> Loading...
          </li>
        </ul>
      );
    }
    return (
      <div>
        <h1 className='section-heading icon icon-book'>{ this.props.data.name } <small>by { this.getAuthorNames().join(', ') }</small></h1>
        <div className='block text-highlight'>
          { this.props.data.description }
        </div>
        <dl className='row inset-panel padded'>
          <dt className='col-xs-2' style={ { display: this.props.data.id ? 'block' : 'none' } }>Registry</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.id ? 'block' : 'none' } }>
            <div className='inline-block'>
              ID:<kbd>{ this.props.data.id }</kbd>
            </div>
            <div className='inline-block'>
              <a href={ `http://platformio.org/lib/show/${this.props.data.id}/${this.props.data.name}` }>
                { `http://platformio.org/lib/show/${this.props.data.id}/${this.props.data.name}` }
              </a>
            </div>
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.__pkg_dir ? 'block' : 'none' } }>Location</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.__pkg_dir ? 'block' : 'none' } }>
            <a onClick={ () => this.onDidReveal(this.props.data.__pkg_dir) }>
              { this.props.data.__pkg_dir }
            </a>
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.homepage ? 'block' : 'none' } }>Homepage</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.homepage ? 'block' : 'none' } }>
            <a href={ this.props.data.homepage }>
              { this.props.data.homepage }
            </a>
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.repository ? 'block' : 'none' } }>Repository</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.repository ? 'block' : 'none' } }>
            <a href={ this.props.data.repository }>
              { this.props.data.repository }
            </a>
          </dd>
          <dt className='col-xs-2'>Authors</dt>
          <dd className='col-xs-10'>
            { this.props.data.authors.map(item => (
                <div className='lib-author'>
                  <strong>{ item.name }</strong> <span>{ item.maintainer ? '(maintainer)' : '' }</span>
                  { item.email &&
                    <div>
                      <span className='icon icon-mail'></span>
                      <a onClick={ () => this.onDidEmail(item.email) }>
                        { item.email }
                      </a>
                    </div> }
                  { item.url &&
                    <div>
                      <span className='icon icon-link'></span>
                      <a href={ item.url }>
                        { item.url }
                      </a>
                    </div> }
                  <div>
                    <span className='icon icon-code'></span><a onClick={ () => this.onDidAuthorSearch(item.name) }>Libraries</a>
                  </div>
                </div>
              )) }
          </dd>
          <dt className='col-xs-2'>Compatibility</dt>
          <dd className='col-xs-10 inline-anchors'>
            { this.props.data.frameworks.length &&
              <div className='block'>
                <span title='Compatible frameworks' className='icon icon-gear'></span>
                { this.props.data.frameworks.map(item => (
                    <a onClick={ () => this.onDidFrameworkSearch(item.name) }>
                      { item.title }
                    </a>
                  )) }
              </div> }
            { this.props.data.platforms.length &&
              <div>
                <span title='Compatible development platforms' className='icon icon-device-desktop'></span>
                { this.props.data.platforms.map(item => (
                    <a onClick={ () => this.onDidPlatformSearch(item.name) }>
                      { item.title }
                    </a>
                  )) }
              </div> }
          </dd>
          <dt className='col-xs-2'>Keywords</dt>
          <dd className='col-xs-10 inline-buttons'>
            { this.props.data.keywords.map(name => (
                <button onClick={ () => this.onDidKeywordSearch(name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { name }
                </button>
              )) }
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.dlstats ? 'block' : 'none' } }>Downloads</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.dlstats ? 'block' : 'none' } }>
            <div>
              { this.props.data.dlstats ? this.props.data.dlstats.day : '' } downloads in the last day
            </div>
            <div>
              { this.props.data.dlstats ? this.props.data.dlstats.week : '' } downloads in the last week
            </div>
            <div>
              { this.props.data.dlstats ? this.props.data.dlstats.month : '' } downloads in the last month
            </div>
          </dd>
          <dt className='col-xs-2'>Version</dt>
          <dd className='col-xs-10'>
            <strong>{ this.props.data.version.name || this.props.data.version }</strong>
            { this.props.data.version.released &&
              <small title={ this.props.data.version.released }> last updated { humanize.relativeTime(new Date(this.props.data.version.released).getTime() / 1000) }</small> }
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.__src_url ? 'block' : 'none' } }>Source</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.__src_url ? 'block' : 'none' } }>
            { this.props.data.__src_url }
          </dd>
        </dl>
        <br />
      </div>
    );
  }
}
