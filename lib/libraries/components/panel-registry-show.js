/** @babel */
/** @jsx etchDom */

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

import { BasePanel, EtchComponent } from '../../etch-component';
import LibRegistryShowExamplesPanel from './panel-registry-show-examples';
import LibRegistryShowHeadersPanel from './panel-registry-show-headers';
import LibRegistryShowInstallationPanel from './panel-registry-show-installation';
import LibRegistryShowManifestPanel from './panel-registry-show-manifest';
import LibRegistryShowView from './registry-show-view';
import { dom as etchDom } from 'etch';
import { runLibraryCommand } from '../util';

export default class LibRegistryShowPanel extends BasePanel {

  onDidPanelShow() {
    // reset previous view
    this.showSubPanel(null);
    this.refs.registryShow.update({
      data: null
    });
    this.getSubPanels().forEach((item) => this.refs[`${item.id}Panel`].update({
      data: null
    }));

    runLibraryCommand('show', null, this.props.id, '--json-output').then(data => {
      this.props.name = data.name;
      this.refs.registryShow.update({
        data
      });
      this.refs.examplesPanel.update({
        data: data.examples
      });
      this.refs.installationPanel.update({
        data
      });
      this.refs.headersPanel.update({
        data: data.headers
      });
      this.refs.manifestPanel.update({
        data: data.confurl
      });

      // show first subpanel
      this.showSubPanel(this.getSubPanels()[0].id);
    });
  }

  onDidDiscussionOpen() {
    utils.openUrl(`http://platformio.org/lib/show/${this.props.id}/${this.props.name}/discussion`);
  }

  getSubPanels() {
    return [
      {
        id: 'examples',
        icon: 'mortar-board',
        component: (
        <LibRegistryShowExamplesPanel ref='examplesPanel' homebus={ this.props.homebus } />
        )
      },
      {
        id: 'installation',
        icon: 'cloud-download',
        component: (
        <LibRegistryShowInstallationPanel ref='installationPanel' homebus={ this.props.homebus } />
        )
      },
      {
        id: 'headers',
        icon: 'file-code',
        component: (
        <LibRegistryShowHeadersPanel ref='headersPanel' homebus={ this.props.homebus } />
        )
      },
      {
        id: 'manifest',
        icon: 'pencil',
        component: (
        <LibRegistryShowManifestPanel ref='manifestPanel' homebus={ this.props.homebus } />
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
    this.refs.showSubmenu.update({
      selected: id
    });
  }

  render() {
    return (
      <div className='lib-show-panel'>
        <LibRegistryShowView ref='registryShow' homebus={ this.props.homebus } />
        <LibRegistryShowSubmenu ref='showSubmenu'
          items={ this.getSubPanels() }
          ondiddiscussion={ () => this.onDidDiscussionOpen() }
          onpanelchanged={ (id) => this.showSubPanel(id) } />
        { this.getSubPanels().map((item) => item.component) }
      </div>
    );
  }
}

class LibRegistryShowSubmenu extends EtchComponent {

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
      <div ref='submenu' className='submenu btn-group btn-group-lg'>
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
