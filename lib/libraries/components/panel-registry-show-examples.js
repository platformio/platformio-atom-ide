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
import path from 'path';

export default class LibRegistryShowExamplesPanel extends BasePanel {

  update(props) {
    if (props.data) {
      props.data = props.data.sort();
    }
    super.update(props);
  }

  onDidPanelShow() {
    if (this.props.data && this.props.data.length) {
      this.onDidExampleChange(this.props.data[0]);
    }
  }

  onDidExampleChange(url) {
    const editor = this.refs.exampleEditor;
    editor.setText('Loading...');
    utils.processHTTPRequest(
      {
        url
      },
      (error, response, body) => {
        if (error) {
          return utils.notifyError(
            'Could not load example. Please try later.', error);
        }
        editor.setGrammar(atom.grammars.grammarForScopeName('source.c'));
        editor.setText(body);
      },
      '15m'
    );
  }

  render() {
    return (
      <div className='lib-examples'>
        <ul style={ { display: this.props.data && !this.props.data.length ? 'block' : 'none' } } className='background-message text-center'>
          <li>
            No examples
          </li>
        </ul>
        <div style={ { display: this.props.data && this.props.data.length ? 'block' : 'none' } }>
          <div className='block'>
            <select onchange={ (e) => this.onDidExampleChange(e.target.value) } className='input-select'>
              { (this.props.data ? this.props.data : []).map(url => (
                  <option value={ url }>
                    { path.basename(url) }
                  </option>
                )) }
            </select>
          </div>
          <TextEditor ref='exampleEditor' />
        </div>
      </div>
      );
  }

}
