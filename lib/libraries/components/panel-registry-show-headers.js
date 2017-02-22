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

import { BasePanel } from '../../etch-component';

import { dom as etchDom } from 'etch';

export default class LibRegistryShowHeadersPanel extends BasePanel {

  render() {
    return (
      <div className='lib-headers'>
        { this.props.data && !this.props.data.length ? (
          <ul className='background-message text-center'>
            <li>
              No headers
            </li>
          </ul>
          ) : ('') }
        <ul>
          { (this.props.data ? this.props.data : []).map(header => (
              <li onclick={ atom.clipboard.write(header) }>
                <a><span title='Copy to clipboard' className='icon icon-clippy'></span></a> <span className='inline-block highlight'>{ header }</span>
              </li>
            )) }
        </ul>
      </div>
    );
  }

}
