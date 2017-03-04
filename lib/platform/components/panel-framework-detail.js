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
import { expandFrameworksOrPlatforms, getBoards, runPlatformCommand } from './../util';

import BoardsExplorerView from './boards-view';


export default class FrameworkDetailPanel extends BasePanel {

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
      case 'string': {
        const frameworks = await runPlatformCommand('frameworks', {
          extraArgs: ['--json-output']
        });
        for (const f of frameworks) {
          if (f.name === this.props.data) {
            item = f;
            break;
          }
        }
        break;
      }
    }
    if (!item) {
      utils.notifyError('Could not fetch framework data', this.props.data);
      return null;
    }
    if (item.platforms && item.platforms.length && typeof item.platforms[0] === 'string') {
      item.platforms = await expandFrameworksOrPlatforms('platforms', item.platforms);
    }
    // if platform from a registry
    if (!item.boards) {
      item.boards = await this.getFrameworkBoards(item.name);
    }
    this.refs.detailView.update({
      item
    });
  }

  async getFrameworkBoards(framework) {
    return (await getBoards()).filter(item => item.frameworks.includes(framework));
  }

  onDidPlatform(event, name) {
    event.stopPropagation();
    this.props.homebus.emit('platform-show', name);
  }

  render() {
    return (
      <div className='detail-panel'>
        <FrameworkDetailView ref='detailView' homebus={ this.props.homebus } onplatform={ (e, name) => this.onDidPlatform(e, name) } />
      </div>
    );
  }
}

class FrameworkDetailView extends BaseView {

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
        <div className='native-key-bindings' tabIndex='-1'>
          <h1 className='section-heading icon icon-gear'>{ this.props.item.title }</h1>
          <div className='block text-highlight'>
            { this.props.item.description }
          </div>
          <dl className='row inset-panel padded'>
            <dt className='col-xs-2'>Name</dt>
            <dd className='col-xs-10'>
              <a onclick={ () => atom.clipboard.write(this.props.item.name) }><span title='Copy to clipboard' className='icon icon-clippy'></span></a> <span className='inline-block highlight'>{ this.props.item.name }</span>
            </dd>
            <dt className='col-xs-2'>Homepage</dt>
            <dd className='col-xs-10'>
              <a href={ this.props.item.homepage }>
                { this.props.item.homepage }
              </a>
            </dd>
            <dt className='col-xs-2'>Documentation</dt>
            <dd className='col-xs-10'>
              <a href={ `http://docs.platformio.org/page/frameworks/${this.props.item.name}.html` }>
                { `http://docs.platformio.org/page/frameworks/${this.props.item.name}.html` }
              </a>
            </dd>
            <dt className='col-xs-2'>Vendor</dt>
            <dd className='col-xs-10'>
              <a href={ this.props.item.url }>
                { this.props.item.url }
              </a>
            </dd>
            <dt className='col-xs-2'>Platforms</dt>
            <dd className='col-xs-10'>
              { this.props.item.platforms.map(item => (
                  <button onclick={ (e) => this.props.onplatform(e, item.name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                    { item.title }
                  </button>
                )) }
            </dd>
          </dl>
        </div>

        { this.props.item.boards && this.props.item.boards.length ? (
          <BoardsExplorerView homebus={ this.props.homebus } title='Boards' items={ this.props.item.boards } />
          ) : ('') }
      </div>
    );
  }

}
