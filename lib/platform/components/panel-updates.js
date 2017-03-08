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


export default class PlatformInstalledPanel extends BasePanel {

  async onDidPanelShow() {
    // reset previous view
    this.refs.listItems.update({
      items: null
    });
    const items = await runPlatformCommand('update', {
      extraArgs: ['--only-check', '--json-output']
    });
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
        <PlatformListItems ref='listItems' homebus={ this.props.homebus } actions={ ['reveal', 'update'] } />
      </div>
    );
  }

}
