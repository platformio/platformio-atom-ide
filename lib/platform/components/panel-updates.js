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

  onDidUpdateOnlyPackages(event) {
    event.stopPropagation();
    event.target.classList.add('btn-inprogress', 'disabled');
    runPlatformCommand('update', { extraArgs: ['--only-packages'] }).then(
      result => {
        atom.notifications.addSuccess(
          'Packages update result', {
            detail: result,
            dismissable: true
          }
        );
        event.target.classList.remove('btn-inprogress', 'disabled');
      },
      () => event.target.classList.remove('btn-inprogress', 'disabled')
    );
  }

  render() {
    return (
      <div>
        <div className='block row'>
          <div className='col-xs-9'>
            <span className='icon icon-question'></span> Please note that you can update only the packages and keep current verion of the installed platforms.
          </div>
          <div className='col-xs-3 text-right'>
            <button onclick={ (e) => this.onDidUpdateOnlyPackages(e) } className='btn btn-primary icon icon-cloud-download inline-block-tight'>Update Packages</button>
          </div>
        </div>
        <PlatformListItems ref='listItems' homebus={ this.props.homebus } actions={ ['reveal', 'update'] } />
      </div>
    );
  }

}
