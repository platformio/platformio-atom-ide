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


export default class PlatformDesktopPanel extends BasePanel {

  async onDidPanelShow() {
    if (this.isFrozenPanel()) {
      return;
    }
    const items = (await runPlatformCommand('search', {
      extraArgs: ['--json-output']
    })).filter(item => item.forDesktop);
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
          <span className='icon icon-question'></span> Native development platform depends on system <kbd>gcc</kbd>. Please install it and check <kbd>gcc --version</kbd> command.
        </div>
        <PlatformListItems ref='listItems' homebus={ this.props.homebus } actions={ ['install'] } />
      </div>
    );
  }
}
