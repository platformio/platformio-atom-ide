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

import PlatformListItems from './list-items';


export default class PlatformEmbeddedPanel extends BasePanel {

  async onDidPanelShow() {
    if (this.isFrozenPanel()) {
      return;
    }
    const items = (await runPlatformCommand('search', {
      extraArgs: ['--json-output']
    })).filter(item => !item.forDesktop);
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
        <div className='block text'>
          <span className='icon icon-question'></span> Please read more how to <a href='http://docs.platformio.org/page/platforms/creating_platform.html'>create a custom development platform</a> or <a href='http://docs.platformio.org/page/userguide/platforms/cmd_install.html'>install specific version using VCS, archive, SemVer, etc.</a>
        </div>
        <PlatformListItems ref='listItems' homebus={ this.props.homebus } actions={ ['install'] } />
      </div>
    );
  }
}
