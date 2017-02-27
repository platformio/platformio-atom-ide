/** @babel */
/** @jsx etch.dom */

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

import { BasePanel, EtchComponent } from '../../view';
import { getAllFrameworks, getAllPlatforms } from '../../platform/util';
import LibLibraryExamplesPanel from './panel-library-examples';
import LibLibraryHeadersPanel from './panel-library-headers';
import LibLibraryInstallationPanel from './panel-library-installation';
import LibLibraryManifestPanel from './panel-library-manifest';
import LibLibraryView from './library-view';
import etch from 'etch';
import { runLibraryCommand } from '../util';

export default class LibLibraryPanel extends BasePanel {

  async onDidPanelShow() {
    // reset previous main view
    this.refs.libraryView.update({
      data: null
    });
    // hide and reset all subpanels
    this.showSubPanel(null);
    this.getSubPanels().forEach((item) => this.refs[`${item.id}Panel`].update({
      data: null
    }));

    // this.props.data can be Registry ID or Library Manifest Object
    switch (typeof this.props.data) {
      case 'number':
        this.props.data = await runLibraryCommand(
          'show', null, parseInt(this.props.data), '--json-output');
        break;

      case 'object':
        this.props.data = await this.sanitizeRawManifest(this.props.data);
        break;
    }

    if (!this.props.data) {
      return;
    }

    this.refs.libraryView.update({
      data: this.props.data
    });
    this.getSubPanels().forEach((item) => this.refs[`${item.id}Panel`].update({
      data: this.props.data
    }));
    // show first subpanel
    this.showSubPanel(this.getSubPanels()[0].id);
  }

  async sanitizeRawManifest(data) {
    // fix platforms and frameworks
    for (const key of ['platforms', 'frameworks']) {
      if (!data.hasOwnProperty(key) || (data[key].length && typeof data[key][0] === 'object' && data[key][0].name)) {
        continue;
      }
      let detailedItems = null;
      try {
        detailedItems = await (key === 'platforms' ? getAllPlatforms() : getAllFrameworks());
      } catch (err) {
        console.error(`Can not fetch ${key} data`, err);
        detailedItems = null;
      }
      if (data[key] === '*' || data[key][0] === '*') {
        data[key] = [];
        if (detailedItems) {
          detailedItems.forEach(item => {
            data[key].push({
              name: item.name,
              title: item.title
            });
          });
        }
      } else {
        data[key] = data[key].map(name => {
          const result = {
            name: name,
            title: utils.title(name)
          };
          if (detailedItems) {
            detailedItems.forEach(item => {
              if (item.name === name) {
                result.title = item.title;
              }
            });
          }
          return result;
        });
      }
    }

    // fix repository url
    if (data.repository && data.repository.url) {
      data.repository = data.repository.url;
    }

    // missed fields
    for (const key of ['authors', 'frameworks', 'platforms', 'keywords']) {
      if (!data.hasOwnProperty(key)) {
        data[key] = [];
      }
    }

    return data;
  }

  onDidDiscussionOpen() {
    let url = 'https://community.platformio.org';
    if (this.props.data.id && this.props.data.name) {
      url = `http://platformio.org/lib/show/${this.props.data.id}/${this.props.data.name}/discussion`;
    }
    utils.openUrl(url);
  }

  getSubPanels() {
    return [
      {
        id: 'examples',
        icon: 'mortar-board',
        component: (
        <LibLibraryExamplesPanel ref='examplesPanel' homebus={ this.props.homebus } />
        )
      },
      {
        id: 'installation',
        icon: 'cloud-download',
        component: (
        <LibLibraryInstallationPanel ref='installationPanel' homebus={ this.props.homebus } />
        )
      },
      {
        id: 'headers',
        icon: 'file-code',
        component: (
        <LibLibraryHeadersPanel ref='headersPanel' homebus={ this.props.homebus } />
        )
      },
      {
        id: 'manifest',
        icon: 'pencil',
        component: (
        <LibLibraryManifestPanel ref='manifestPanel' homebus={ this.props.homebus } />
        )
      }
    ];
  }

  showSubPanel(id) {
    this._panel_id = id;
    this.getSubPanels().forEach((item) => {
      if (item.id === id) {
        this.refs[`${item.id}Panel`].showPanel();
      } else {
        this.refs[`${item.id}Panel`].hidePanel();
      }
    });
    this.refs.librarySubmenu.update({
      selected: id
    });
  }

  render() {
    return (
      <div className='lib-show-panel'>
        <LibLibraryView ref='libraryView' homebus={ this.props.homebus } />
        <LibLibrarySubmenu ref='librarySubmenu'
          items={ this.getSubPanels() }
          ondiddiscussion={ () => this.onDidDiscussionOpen() }
          onpanelchanged={ (id) => this.showSubPanel(id) } />
        { this.getSubPanels().map((item) => item.component) }
      </div>
    );
  }
}

class LibLibrarySubmenu extends EtchComponent {

  getClassListForItem(item) {
    const classList = ['btn', 'icon', `icon-${item.icon}`];
    if (this.props.selected === item.id) {
      classList.push('selected');
    }
    return classList;
  }

  render() {
    if (!this.props.selected) {
      return (<span></span>);
    }
    return (
      <div className='panel-submenu btn-group btn-group-lg'>
        { this.props.items.map(item => (
            <button onclick={ () => this.props.onpanelchanged(item.id) } className={ this.getClassListForItem(item).join(' ') }>
              { utils.title(item.id) }
            </button>
          )) }
        <button onclick={ this.props.ondiddiscussion } className='btn icon icon-comment-discussion'>
          Discussion
        </button>
      </div>
    );
  }

}
