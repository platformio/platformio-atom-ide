/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import LibraryDetailExamples from '../components/detail-examples';
import PropTypes from 'prop-types';
import React from 'react';
import fs from 'fs-plus';
import glob from 'glob';
import path from 'path';


export default class LibraryDetailExamplesBlock extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      examples: PropTypes.array,
      __pkg_dir: PropTypes.string
    }).isRequired
  }

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
        <LibraryDetailExamples items={ this.getItems() } />
      </div>
    );
  }

}
