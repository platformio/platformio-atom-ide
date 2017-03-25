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


export default class PlatformMain extends React.Component {

  static propTypes = {
    data: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      title: React.PropTypes.string.isRequired,
      description: React.PropTypes.string.isRequired,
      homepage: React.PropTypes.string.isRequired,
      repository: React.PropTypes.string,
      url: React.PropTypes.string,
      license: React.PropTypes.string,
      version: React.PropTypes.string,
      versions: React.PropTypes.arrayOf(React.PropTypes.string),
      frameworks: React.PropTypes.arrayOf(React.PropTypes.object),
      __src_url: React.PropTypes.string,
      __pkg_dir: React.PropTypes.string
    }),
    showFramework: React.PropTypes.func.isRequired,
    installPlatform: React.PropTypes.func.isRequired
  }

  onDidReveal(dir) {
    utils.revealFolder(dir);
  }

  onDidInstall(event) {
    event.stopPropagation();
    const button = event.target;
    button.classList.add('btn-inprogress', 'disabled');
    this.props.installPlatform(
      `${this.props.data.name}@${this.refs.versionSelect.value}`,
      () => button.classList.remove('btn-inprogress', 'disabled')
    );
  }

  render() {
    return (
      <div className='native-key-bindings' tabIndex='-1'>
        <h1 className='section-heading icon icon-device-desktop'>{ this.props.data.title }</h1>
        <div className='block text-highlight'>
          { this.props.data.description }
        </div>
        <dl className='row inset-panel padded'>
          <dt className='col-xs-2'>Name</dt>
          <dd className='col-xs-10'>
            <a onClick={ () => atom.clipboard.write(this.props.data.name) }><span title='Copy to clipboard' className='icon icon-clippy'></span></a> <span className='inline-block highlight'>{ this.props.data.name }</span>
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.__pkg_dir ? 'block' : 'none' } }>Location</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.__pkg_dir ? 'block' : 'none' } }>
            <a onClick={ () => this.onDidReveal(this.props.data.__pkg_dir) }>
              { this.props.data.__pkg_dir }
            </a>
          </dd>
          <dt className='col-xs-2'>Homepage</dt>
          <dd className='col-xs-10'>
            <a href={ this.props.data.homepage }>
              { this.props.data.homepage }
            </a>
          </dd>
          <dt className='col-xs-2'>Documentation</dt>
          <dd className='col-xs-10'>
            <a href={ `http://docs.platformio.org/page/platforms/${this.props.data.name}.html` }>
              { `http://docs.platformio.org/page/platforms/${this.props.data.name}.html` }
            </a>
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.repository ? 'block' : 'none' } }>Repository</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.repository ? 'block' : 'none' } }>
            <a href={ this.props.data.repository }>
              { this.props.data.repository }
            </a>
          </dd>
          <dt className='col-xs-2'>Vendor</dt>
          <dd className='col-xs-10'>
            <a href={ this.props.data.url }>
              { this.props.data.url }
            </a>
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.license ? 'block' : 'none' } }>License</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.license ? 'block' : 'none' } }>
            { this.props.data.license }
          </dd>
          <dt className='col-xs-2'>Frameworks</dt>
          <dd className='col-xs-10 inline-buttons'>
            { this.props.data.frameworks.map(item => (
                <button onClick={ () => this.props.showFramework(item.name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { item.title }
                </button>
              )) }
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.version ? 'block' : 'none' } }>Version</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.version ? 'block' : 'none' } }>
            { this.props.data.version }
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.__src_url ? 'block' : 'none' } }>Source</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.__src_url ? 'block' : 'none' } }>
            { this.props.data.__src_url }
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.versions ? 'block' : 'none' } }>Versions</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.versions ? 'block' : 'none' } }>
            <ul className='list-inline'>
              <li>
                <select ref='versionSelect' className='input-select'>
                  { (this.props.data.versions || []).slice().reverse().map(name => (
                      <option value={ name }>
                        { name }
                      </option>
                    )) }
                </select>
              </li>
              <li>
                <button onClick={ ::this.onDidInstall } className='btn btn-primary icon icon-cloud-download'>
                  Install
                </button>
              </li>
            </ul>
          </dd>
        </dl>
      </div>
    );
  }
}
