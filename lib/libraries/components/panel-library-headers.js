/** @babel */
/** @jsx etch.dom */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import { BasePanel, EtchComponent } from '../../view';

import etch from 'etch';
import klaw from 'klaw';
import path from 'path';

export default class LibLibraryHeadersPanel extends BasePanel {

  onDidPanelShow() {
    if (this.props.data && this.props.data.headers) {
      this.refs.headersView.update({
        items: this.props.data.headers
      });
    } else {
      this.scanLibHeaders(this.props.data.__pkg_dir).then(items => {
        this.refs.headersView.update({
          items
        });
      });
    }
  }

  scanLibHeaders(libDir) {
    return new Promise(resolve => {
      const items = [];
      klaw(libDir, {
        filter: item => {
          return !['test', 'tests', 'example', 'examples'].includes(path.basename(item));
        }
      })
        .on('data', function(item) {
          if (!['.h', '.hpp'].includes(path.extname(item.path))) {
            return;
          }
          if (items.includes(path.basename(item.path))) {
            return;
          }
          items.push(path.basename(item.path));
        })
        .on('end', function() {
          resolve(items);
        });
    });
  }

  render() {
    return (
      <div className='lib-headers'>
        <LibLibraryHeadersView ref='headersView' />
      </div>
    );
  }

}

class LibLibraryHeadersView extends EtchComponent {

  render() {
    return (
      <div className='lib-headers'>
        { this.props.items && !this.props.items.length ? (
          <ul className='background-message text-center'>
            <li>
              No headers
            </li>
          </ul>
          ) : ('') }
        <ul>
          { (this.props.items ? this.props.items : []).map(header => (
              <li onclick={ () => atom.clipboard.write(header) }>
                <a><span title='Copy to clipboard' className='icon icon-clippy'></span></a> <span className='inline-block highlight'>{ header }</span>
              </li>
            )) }
        </ul>
      </div>
    );
  }

}
