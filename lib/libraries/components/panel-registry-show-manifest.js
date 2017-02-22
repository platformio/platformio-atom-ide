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

import * as utils from '../../utils';

import { BasePanel } from '../../etch-component';
import { TextEditor } from 'atom';
import { dom as etchDom } from 'etch';

export default class LibRegistryShowManifestPanel extends BasePanel {

  onDidPanelShow() {
    const editor = this.refs.manifestEditor;
    editor.setText('Loading...');
    utils.processHTTPRequest(
      {
        url: this.props.data
      },
      (error, response, body) => {
        if (error) {
          return utils.notifyError(
            'Could not load manifest. Please try later.', error);
        }
        editor.setGrammar(atom.grammars.grammarForScopeName(
          this.props.data.endsWith('.json') ? 'source.json' : 'source.ini'));
        editor.setText(body);
      },
      '15m'
    );
  }

  onDidEdit() {
    const url = this.props.data;
    if (url.startsWith('https://raw.githubusercontent.com')) {
      const matches = url.match(new RegExp('content\.com/([^/]+/[^/]+)/(.+)$'));
      if (matches) {
        return utils.openUrl(`https://github.com/${matches[1]}/blob/${matches[2]}`);
      }
    }
    utils.openUrl(url);
  }

  render() {
    return (
      <div className='lib-manifest'>
        <div className='row'>
          <div className='col-sm-10'>
            <span className='inline-block-tight'>Specification for manifests:</span>
            <span className='inline-block-tight'><a href='http://docs.platformio.org/page/librarymanager/config.html'>library.json</a>,</span>
            <span className='inline-block-tight'><a href='https://github.com/arduino/Arduino/wiki/Arduino-IDE-1.5:-Library-specification'>library.properties</a>,</span>
            <span className='inline-block-tight'><a href='http://yottadocs.mbed.com/reference/module.html'>module.json</a></span>
          </div>
          <div className='col-sm-2 text-right'>
            <button onclick={ () => this.onDidEdit() } className='btn btn-sm'>
              Edit Manifest
            </button>
          </div>
        </div>
        <TextEditor ref='manifestEditor' />
      </div>
    );
  }

}
