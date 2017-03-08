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
import { expandFrameworksOrPlatforms, expandPackages, getBoards, runPlatformCommand } from './../util';

import BoardsExplorerView from './boards-view';


export default class PlatformDetailPanel extends BasePanel {

  async onDidPanelShow() {
    // reset previous view
    this.refs.detailView.update({
      item: null
    });

    let item = null;
    switch (typeof this.props.data) {
      // registry data as object
      case 'object':
        item = this.props.data;
        break;

      // if platform version, load data from Core
      case 'string':
        try {
          item = await runPlatformCommand('show', {
            extraArgs: [this.props.data, '--json-output'],
            silent: true
          });
        }
        // when platform has not been installed yet
        catch (err) {
          console.error(err);
          const platforms = await runPlatformCommand('search', {
            extraArgs: ['--json-output']
          });
          for (const p of platforms) {
            if (p.name === this.props.data) {
              item = p;
              break;
            }
          }
        }
        break;
    }
    if (!item) {
      utils.notifyError('Could not fetch platform data', this.props.data);
      return null;
    }
    if (item.frameworks && item.frameworks.length && typeof item.frameworks[0] === 'string') {
      item.frameworks = await expandFrameworksOrPlatforms('frameworks', item.frameworks);
    }
    if (item.packages && item.packages.length && typeof item.packages[0] === 'string') {
      item.packages = await expandPackages(item.packages);
    }
    // if platform from a registry
    if (!item.boards) {
      item.boards = await this.getPlatformBoards(item.name);
    }
    this.refs.detailView.update({
      item
    });
  }

  async getPlatformBoards(platform) {
    return (await getBoards()).filter(item => item.platform === platform);
  }

  onDidInstall(event, name) {
    event.stopPropagation();
    event.target.classList.add('btn-inprogress', 'disabled');
    this.props.homebus.emit(
      'platform-install', [
        name,
        () => event.target.classList.remove('btn-inprogress', 'disabled')
      ]);
  }

  onDidFramework(event, name) {
    event.stopPropagation();
    this.props.homebus.emit('framework-show', name);
  }

  render() {
    return (
      <div className='detail-panel'>
        <PlatformDetailView ref='detailView'
          homebus={ this.props.homebus }
          oninstall={ (e, name) => this.onDidInstall(e, name) }
          onframework={ (e, name) => this.onDidFramework(e, name) } />
      </div>
    );
  }
}

class PlatformDetailView extends BaseView {

  render() {
    if (!this.props.item) {
      return (
        <div>
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul>
        </div>
      );
    }
    return (
      <div>
        <PlatformDetailMainView item={ this.props.item } oninstall={ this.props.oninstall } onframework={ this.props.onframework } />
        <PlatformDetailPackagesView items={ this.props.item.packages } />
        { this.props.item.boards && this.props.item.boards.length ? (
          <BoardsExplorerView homebus={ this.props.homebus } title='Boards' items={ this.props.item.boards } />
          ) : ('') }
      </div>
    );
  }

}

class PlatformDetailMainView extends BaseView {

  onDidReveal(dir) {
    utils.revealFolder(dir);
  }

  render() {
    return (
      <div className='native-key-bindings' tabIndex='-1'>
        <h1 className='section-heading icon icon-device-desktop'>{ this.props.item.title }</h1>
        <div className='block text-highlight'>
          { this.props.item.description }
        </div>
        <dl className='row inset-panel padded'>
          <dt className='col-xs-2'>Name</dt>
          <dd className='col-xs-10'>
            <a onclick={ () => atom.clipboard.write(this.props.item.name) }><span title='Copy to clipboard' className='icon icon-clippy'></span></a> <span className='inline-block highlight'>{ this.props.item.name }</span>
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.item.__pkg_dir ? 'block' : 'none' } }>Location</dt>
          <dd className='col-xs-10' style={ { display: this.props.item.__pkg_dir ? 'block' : 'none' } }>
            <a onclick={ () => this.onDidReveal(this.props.item.__pkg_dir) }>
              { this.props.item.__pkg_dir }
            </a>
          </dd>
          <dt className='col-xs-2'>Homepage</dt>
          <dd className='col-xs-10'>
            <a href={ this.props.item.homepage }>
              { this.props.item.homepage }
            </a>
          </dd>
          <dt className='col-xs-2'>Documentation</dt>
          <dd className='col-xs-10'>
            <a href={ `http://docs.platformio.org/page/platforms/${this.props.item.name}.html` }>
              { `http://docs.platformio.org/page/platforms/${this.props.item.name}.html` }
            </a>
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.item.repository ? 'block' : 'none' } }>Repository</dt>
          <dd className='col-xs-10' style={ { display: this.props.item.repository ? 'block' : 'none' } }>
            <a href={ this.props.item.repository }>
              { this.props.item.repository }
            </a>
          </dd>
          <dt className='col-xs-2'>Vendor</dt>
          <dd className='col-xs-10'>
            <a href={ this.props.item.url }>
              { this.props.item.url }
            </a>
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.item.license ? 'block' : 'none' } }>License</dt>
          <dd className='col-xs-10' style={ { display: this.props.item.license ? 'block' : 'none' } }>
            { this.props.item.license }
          </dd>
          <dt className='col-xs-2'>Frameworks</dt>
          <dd className='col-xs-10'>
            { this.props.item.frameworks.map(item => (
                <button onclick={ (e) => this.props.onframework(e, item.name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { item.title }
                </button>
              )) }
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.item.version ? 'block' : 'none' } }>Version</dt>
          <dd className='col-xs-10' style={ { display: this.props.item.version ? 'block' : 'none' } }>
            { this.props.item.version }
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.item.__src_url ? 'block' : 'none' } }>Source</dt>
          <dd className='col-xs-10' style={ { display: this.props.item.__src_url ? 'block' : 'none' } }>
            { this.props.item.__src_url }
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.item.versions ? 'block' : 'none' } }>Versions</dt>
          <dd className='col-xs-10' style={ { display: this.props.item.versions ? 'block' : 'none' } }>
            <ul className='list-inline'>
              <li>
                <select ref='versionSelect' className='input-select'>
                  { (this.props.item.versions ? this.props.item.versions : []).slice().reverse().map(name => (
                      <option value={ name }>
                        { name }
                      </option>
                    )) }
                </select>
              </li>
              <li>
                <button onclick={ (e) => this.props.oninstall(e, `${this.props.item.name}@${this.refs.versionSelect.value}`) } className='btn btn-primary icon icon-cloud-download'>
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

class PlatformDetailPackagesView extends BaseView {

  render() {
    if (!this.props.items || this.props.items.length === 0) {
      return <span></span>;
    }
    return (
      <div>
        <h2 className='section-heading icon icon-package'>Packages</h2>
        { this.props.items[0].requirements ? (
          <div className='block'>
            <span className='icon icon-question'></span>Optional packages will be installed automatically depending on a build environment.
          </div>
          ) : (
          <div className='block'>
            <span className='icon icon-question'></span>More detailed information about the package requirements and installed versions is available for the installed platforms.
          </div>
          ) }
        <table className='native-key-bindings table table-hover' tabIndex='-1'>
          <thead>
            <tr>
              <th>
                Name
              </th>
              <th>
                Type
              </th>
              <th>
                Optional
              </th>
              <th>
                Requirements
              </th>
              <th>
                Installed
              </th>
              <th>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            { this.props.items.map(item => (
                <tr>
                  <td>
                    { item.url ? (
                      <a href={ item.url }>
                        { item.name }
                      </a>
                      ) : (
                      <span>{ item.name }</span>
                      ) }
                  </td>
                  <td>
                    { item.type }
                  </td>
                  <td className='text-center'>
                    { item.optional ? (
                      <span className='icon icon-check'></span>
                      ) : ('') }
                  </td>
                  <td>
                    { item.requirements }
                  </td>
                  <td>
                    { item.version }
                    { item.originalVersion ? (
                      <span>{ ' ' }({ item.originalVersion })</span>
                      ) : ('') }
                  </td>
                  <td>
                    { item.description }
                  </td>
                </tr>
              )) }
          </tbody>
        </table>
      </div>
    );
  }

}
