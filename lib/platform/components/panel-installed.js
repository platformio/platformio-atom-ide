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

import { BasePanel, jsxDOM } from '../../view';
import { expandFrameworksOrPlatforms, runPlatformCommand } from '../util';

import { CompositeDisposable } from 'atom';
import PlatformListItems from './list-items';


export default class PlatformInstalledPanel extends BasePanel {

  constructor() {
    super(...arguments);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.props.homebus.on(
      'platform-install', ::this.unfreezePanel));
    this.subscriptions.add(this.props.homebus.on(
      'platform-uninstall', ::this.unfreezePanel));
    this.subscriptions.add(this.props.homebus.on(
      'platform-update', ::this.unfreezePanel));
  }

  async onDidPanelShow() {
    if (this.isFrozenPanel()) {
      return;
    }
    // reset previous view
    this.refs.listItems.update({
      items: null
    });    
    const items = await runPlatformCommand('list', {
      extraArgs: ['--json-output']
    });
    this.freezePanel();
    for (const item of items) {
      item.frameworks = await expandFrameworksOrPlatforms('frameworks', item.frameworks);
    }
    this.refs.listItems.update({
      items
    });
  }

  render() {
    return (
      <div>
        <div className='block'>
          <span className='icon icon-question'></span>Project can depend on a specific version of development platform, please use <kbd>platform = name@x.y.z</kbd> option for <b>platformio.ini</b> in this case. <a href='http://docs.platformio.org/page/projectconf.html#platform'>More details...</a>
        </div>
        <PlatformListItems ref='listItems' homebus={ this.props.homebus } actions={ ['reveal', 'uninstall'] } />
      </div>
    );
  }

}
