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

import PlatformInstallAdvancedModal from './install-advanced-modal';
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

  async onDidAdvanced(event) {
    event.stopPropagation();
    event.target.classList.add('btn-inprogress', 'disabled');
    try {
      this.props.homebus.emit(
        'platform-install', [
          await (new PlatformInstallAdvancedModal().open()),
          () => event.target.classList.remove('btn-inprogress', 'disabled')
        ]);
    } catch (err) {
      if (err) {
        console.error(err);
      }
      event.target.classList.remove('btn-inprogress', 'disabled');
    }
  }

  render() {
    return (
      <div>
        <div className='block row'>
          <div className='col-xs-9'>
            <span className='icon icon-question'></span> Please read more how to <a href='http://docs.platformio.org/page/platforms/creating_platform.html'>create a custom development platform</a>.
          </div>
          <div className='col-xs-3 text-right'>
            <button onclick={ (e) => this.onDidAdvanced(e) } className='btn btn-primary icon icon-cloud-download inline-block-tight'>
              Advanced
            </button>
          </div>
        </div>
        <PlatformListItems ref='listItems' homebus={ this.props.homebus } actions={ ['install'] } />
      </div>
    );
  }
}
