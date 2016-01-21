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
import {getPlatformIOExecutable} from '../utils';

export class AboutView {

  constructor(uri) {
    this.uri = uri;

    // Parse template and retrieve its root element
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    this.retrieveVersion();
  }

  retrieveVersion() {
    let stdout = '';
    const result = child_process.spawn(getPlatformIOExecutable(), ['--version']);
    result.stdout.on('data', (chunk) => stdout += chunk);
    result.on('close', (code) => {
      if (0 !== code) {
        this.setCLIVersion('Failed to retrieve');
      } else {
        this.setCLIVersion(stdout.trim().match(/[\d+\.]+.*$/)[0]);
      }
    });
  }

  setCLIVersion(string) {
    let element = this.element.querySelector('.cli-version .version-string');
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

  setProgress(value) {
    this.progress.value = value;
  }

  getElement() {
    return this.element;
  }

  destroy() {
    this.element.remove();
  }
}
