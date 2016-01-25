'use babel';

/**
 * Copyright (C) 2016 Ivan Kravets. All rights reserved.
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

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import {BASE_DIR} from '../constants';

export class AboutView {

  constructor(uri) {
    this.uri = uri;

    // Parse template and retrieve its root element
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    this.wrapper = this.element.querySelector('.version-wrapper');
    this.copy = this.element.querySelector('.version-copy');

    this.copy.onclick = () => {
      const versions = this.wrapper.textContent.trim().replace(/\s+/g, ' ');
      atom.clipboard.write(versions);
    };
    this.copyTooltip = atom.tooltips.add(this.copy, {title: 'Copy versions'});

    this.retrieveIDEVersion();
    this.retrieveCLIVersion();
  }

  retrieveIDEVersion() {
    const version = require(path.join(BASE_DIR, 'package.json')).version;
    this.setVersion(version, '.ide-version');
  }

  retrieveCLIVersion() {
    let stdout = '';
    const result = child_process.spawn("platformio", ['--version']);
    result.stdout.on('data', (chunk) => stdout += chunk);
    result.on('close', (code) => {
      if (0 !== code) {
        this.setVersion('Failed to retrieve', '.cli-version');
      } else {
        this.setVersion(stdout.trim().match(/[\d+\.]+.*$/)[0], '.cli-version');
      }
    });
  }

  setVersion(string, parentClass) {
    let element = this.element.querySelector(parentClass +' .version-string');
    element.textContent = string;
  }

  getTitle() {
    return 'About';
  }

  getIconName() {
    return 'info';
  }

  getURI() {
    return this.uri;
  }

  getElement() {
    return this.element;
  }

  destroy() {
    this.copyTooltip.dispose();
    this.element.remove();
  }
}
