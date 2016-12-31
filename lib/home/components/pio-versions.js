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

import * as utils from '../../utils';

import { EtchComponent } from '../../etch-component';
import { dom as etchDom } from 'etch';

export default class PioVersions extends EtchComponent {

  constructor(props) {
    super(props);
    utils.getCoreVersion((error, result) => {
      if (error) {
        return utils.notifyError('Failed to retrieve PIO Core version', error);
      }
      this.update({
        coreVersion: result
      });
    });
  }

  renderCoreVersion() {
    if (this.props.coreVersion) {
      return this.props.coreVersion;
    }
    return (
      <span className='loading loading-spinner-tiny'></span>
    );
  }

  render() {
    return (
      <div className='block versions'>
        <ul className='list-inline'>
          <li>
            IDE <a href='https://github.com/platformio/platformio-atom-ide/blob/develop/HISTORY.md'><code>{ utils.getIDEVersion() }</code></a>
          </li>
          <li>
            ·
          </li>
          <li>
            Core <a href='https://github.com/platformio/platformio/blob/develop/HISTORY.rst'><code className='inline-block'>{ this.renderCoreVersion() }</code></a>
          </li>
        </ul>
      </div>
    );
  }
}
