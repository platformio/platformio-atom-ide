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
    utils.getPioAPIResult({
      url
    }, (error, response, body) => {
      if (error) {
        return utils.notifyError(
          'Could not load example. Please try later.', error);
      }
      editor.setGrammar(atom.grammars.grammarForScopeName('source.c'));
      editor.setText(body);
    },
      '15m');
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
