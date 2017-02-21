/** @babel */
/** @jsx etchDom */

/**
 * Copyright 2016-present Ivan Kravets <me@ikravets.com>
 *
 * This source file is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import BaseStage from './stages/base';
import { EtchComponent } from '../etch-component';
import { dom as etchDom } from 'etch';

export default class InstallerView extends EtchComponent {

  getStatusClass(status) {
    const classes = ['status', 'icon'];
    switch (status) {

      case BaseStage.STATUS_INSTALLING:
        classes.push('status-modified');
        classes.push('icon-desktop-download');
        break;

      case BaseStage.STATUS_SUCCESSED:
        classes.push('status-added');
        classes.push('icon-check');
        break;

      case BaseStage.STATUS_FAILED:
        classes.push('status-removed');
        classes.push('icon-alert');
        break;

      default:
        classes.push('status-ignored');
        classes.push('icon-clock');
        break;

    }
    return classes.join(' ');
  }

  render() {
    return (
      <div>
        <h1>PlatformIO IDE: Installing...</h1>
        <p>
          Please be patient and let the installation complete.
        </p>
        <div className='select-list'>
          <ol className='list-group'>
            { this.props.stages.map(stage => (
                <li>
                  <div className={ this.getStatusClass(stage.status) }></div>
                  <div className='icon icon-chevron-right'>
                    { stage.name }
                  </div>
                </li>
              )) }
          </ol>
        </div>
      </div>
    );
  }

}
