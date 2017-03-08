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

import * as utils from '../../utils';

import { BasePanel, BaseView, jsxDOM } from '../../view';

import { TextEditor } from 'atom';
import fs from 'fs-plus';
import glob from 'glob';
import path from 'path';


export default class LibLibraryExamplesPanel extends BasePanel {

  onDidPanelShow() {}

  getItems() {
    if (!this.props.data) {
      return [];
    }
    if (this.props.data.__pkg_dir) {
      return this.getRealExamples(this.props.data.__pkg_dir);
    } else if (this.props.data.examples) {
      return this.getRegistryExamples(this.props.data.examples);
    }
    return [];
  }

  getGlobPatterns() {
    if (this.props.data.examples) {
      if (typeof this.props.data.examples === 'string') {
        return [this.props.data.examples];
      }
      return this.props.data.examples;
    }
    const result = [];
    for (const ext of ['*.ino', '*.pde', '*.c', '*.cpp', '*.h', '*.hpp']) {
      const exmDir = '[Ee]xamples';
      result.push(path.join(exmDir, ext));
      result.push(path.join(exmDir, '*', ext));
      result.push(path.join(exmDir, '*', '*', ext));
      result.push(path.join(exmDir, '*', '*', '*', ext));
    }
    return result;
  }

  getRealExamples(libDir) {
    const patterns = this.getGlobPatterns();
    const candidates = new Map();
    for (const pattern of patterns) {
      glob.sync(path.join(libDir, pattern)).forEach(item => {
        const dir = path.dirname(item);
        const name = dir
          .substr(libDir.length + 1)
          .replace(new RegExp('examples?(\\\\|\/)', 'i'), '');
        if (candidates.has(name)) {
          return;
        }
        candidates.set(
          name,
          fs.readdirSync(dir)
            .map(name => path.join(dir, name))
            .filter(name => fs.isFileSync(name))
        );
      });
    }

    const result = [];
    for (const [name, files] of candidates.entries()) {
      result.push({
        name: name,
        files
      });
    }
    result.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0);
    return result;
  }

  getRegistryExamples(urls) {
    return urls.sort().map(url => {
      return {
        name: urls.includes('.') ? path.basename(url, path.extname()) : path.basename(url),
        files: [url]
      };
    });
  }

  render() {
    return (
      <div className='lib-examples'>
        <LibLibraryExamplesView ref='examplesView' items={ this.getItems() } />
      </div>
    );
  }

}

class LibLibraryExamplesView extends BaseView {

  onDidExampleChange(index) {
    this.refs.exampleFiles.update({
      items: this.props.items[index].files
    });
  }

  render() {
    return (
      <div>
        { !this.props.items.length ? (
          <ul className='background-message text-center'>
            <li>
              No examples
            </li>
          </ul>
          ) : ('') }
        <div style={ { display: this.props.items.length ? 'block' : 'none' } }>
          <div className='block'>
            <select onchange={ (e) => this.onDidExampleChange(e.target.value) } className='input-select'>
              { this.props.items.map((item, index) => (
                  <option value={ index }>
                    { item.name }
                  </option>
                )) }
            </select>
          </div>
          <LibLibraryExampleFilesView ref='exampleFiles' items={ this.props.items.length ? this.props.items[0].files : [] } />
        </div>
      </div>
    );
  }

}

class LibLibraryExampleFilesView extends BaseView {

  update(props) {
    super.update(props);
    this.props.items.forEach((item, index) => {
      this.loadFileContentToEditor(item, index);
    });
  }

  loadFileContentToEditor(file, index) {
    const editor = this.refs[`exampleEditor${index}`];
    // wait for a while when TextEditor is not ready
    if (!editor) {
      setTimeout(
        () => this.loadFileContentToEditor(file, index), 300);
      return;
    }
    editor.setText('');
    editor.setGrammar(atom.grammars.grammarForScopeName('source.c'));
    return new Promise((resolve, reject) => {
      if (file.startsWith('http')) {
        utils.processHTTPRequest(
          {
            url: file,
            cacheValid: '15m'
          },
          (err, response, body) => {
            if (err || response.statusCode !== 200) {
              return reject(err);
            }
            resolve(body);
          }
        );
      } else {
        fs.readFile(file, 'utf8', function(err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      }

    })
      .then(content => editor.setText(content))
      .catch(err => utils.notifyError(
        'Could not load example. Please try later.', err)
    );
  }

  onDidToggle(event, index) {
    event.target.classList.toggle('icon-fold');
    event.target.classList.toggle('icon-unfold');
    this.refs[`exampleEditor${index}`].getElement().classList.toggle('hide');
  }

  render() {
    return (
      <div>
        { this.props.items.map((item, index) => (
            <div>
              <h3>{ path.basename(item) } <span className='pull-right'><a onclick={ (e) => this.onDidToggle(e, index) }><span className='icon icon-fold' title='Show/Hide example'></span></a></span></h3>
              <TextEditor ref={ `exampleEditor${index}` } placeholderText='Loading...' />
            </div>
          )) }
      </div>
    );
  }

}
