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

export class InstallPlatformIOView {

  constructor() {
    // Parse template and retrieve its root element
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    // Find important nodes
    this.progress = this.element.querySelector('progress');
    this.cancelButton = this.element.querySelector('.cancel');

    // Set handlers
    this.cancelButton.onclick = () => {
      this.handleCancel();
      this.cancelButton.textContent = 'Canceling...';
      this.cancelButton.disabled = true;
    };
  }

  handleCancel(){}

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
