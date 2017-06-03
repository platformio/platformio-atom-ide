/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';

import PropTypes from 'prop-types';
import React from 'react';


export default class PlatformCard extends React.Component {

  static propTypes = {
    item: PropTypes.shape({
      name: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      version: PropTypes.object,
      versionLatest: PropTypes.object,
      frameworks: PropTypes.array,
      __src_url: PropTypes.string,
      __pkg_dir: PropTypes.string
    }),
    actions: PropTypes.arrayOf(PropTypes.string).isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    installPlatform: PropTypes.func.isRequired,
    uninstallPlatform: PropTypes.func.isRequired,
    updatePlatform: PropTypes.func.isRequired
  }

  onDidReveal(event) {
    event.stopPropagation();
    if (this.props.item.__pkg_dir) {
      utils.revealFolder(this.props.item.__pkg_dir);
    }
  }

  onDidShow(event) {
    event.stopPropagation();
    this.props.showPlatform(this.props.item.version ? `${this.props.item.name}@${this.props.item.version}` : this.props.item.name);
  }

  onDidInstall(event) {
    event.stopPropagation();
    const button = event.target;
    button.classList.add('btn-inprogress', 'disabled');
    this.props.installPlatform(
      this.props.item.name,
      () => button.classList.remove('btn-inprogress', 'disabled')
    );
  }

  onDidUninstallOrUpdate(event, cmd) {
    event.stopPropagation();
    const button = event.target;
    button.classList.add('btn-inprogress', 'disabled');
    (cmd === 'uninstall' ? this.props.uninstallPlatform: this.props.updatePlatform)(
      this.props.item.__pkg_dir,
      () => button.classList.remove('btn-inprogress', 'disabled')
    );
  }

  onDidFramework(event, name) {
    event.stopPropagation();
    this.props.showFramework(name);
  }

  render() {
    return (
      <div onClick={ ::this.onDidShow } className='native-key-bindings block list-item-card' tabIndex='-1'>
        <div className='row'>
          <div className='col-xs-9'>
            <h2><a onClick={ ::this.onDidShow }>{ this.props.item.title }</a></h2>
          </div>
          <div className='col-xs-3 text-right text-nowrap'>
            { this.props.item.version &&
              <span><span className={ 'icon icon-' + (this.props.item.__src_url ? 'git-branch' : 'versions') }></span>
              { this.props.item.version }
              </span> }
          </div>
        </div>
        <div className='block'>
          { this.props.item.description }
        </div>
        <div className='row bottom-xs'>
          <div className='col-xs-7 inline-buttons'>
            { (this.props.item.frameworks || []).map(item => (
                <button onClick={ (e) => this.onDidFramework(e, item.name) } key={ item.title } className='btn btn-sm icon icon-gear inline-block-tight'>
                  { item.title }
                </button>
              )) }
          </div>
          <div className='col-xs-5 text-right card-actions'>
            <div className='btn-group'>
              { this.props.actions.includes('reveal') &&
                <button onClick={ ::this.onDidReveal } className='btn btn-primary icon icon-file-directory'>
                  Reveal
                </button> }
              { this.props.actions.includes('install') &&
                <button onClick={ ::this.onDidInstall } className='btn btn-primary icon icon-cloud-download'>
                  Install
                </button> }
              { this.props.actions.includes('uninstall') &&
                <button onClick={ (e) => this.onDidUninstallOrUpdate(e, 'uninstall') } className='btn btn-primary icon icon-trashcan'>
                  Uninstall
                </button> }
              { this.props.actions.includes('update') &&
                <button onClick={ (e) => this.onDidUninstallOrUpdate(e, 'update') } className='btn btn-primary icon icon-cloud-download'>
                  { this.props.item.versionLatest ? `Update to ${this.props.item.versionLatest}` : 'Update' }
                </button> }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
