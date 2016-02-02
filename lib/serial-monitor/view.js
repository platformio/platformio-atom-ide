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
import {removeChildrenOf} from '../utils';

export class SerialMonitorView {

  constructor() {
    // Parse template and retrieve its root element
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    // Find important nodes
    this.portsSelect = this.element.querySelector('.port-select');
    this.baudrateSelect = this.element.querySelector('.baudrate-select');
    this.openButton = this.element.querySelector('.open');
    this.cancelButton = this.element.querySelector('.cancel');

    // Set handlers
    this.openButton.onclick = () => this.handleOpen();
    this.cancelButton.onclick = () => this.handleCancel();
  }

  setPorts(ports) {
    removeChildrenOf(this.portsSelect);

    let option;
    for (let i = 0; i < ports.length; i++) {
      option = document.createElement('option');
      option.value = ports[i].port;
      option.textContent = ports[i].description + ' at ' + ports[i].port;
      this.portsSelect.appendChild(option);
    }
  }

  getPort() {
    return this.portsSelect.value;
  }

  getBaudrate() {
    return this.baudrateSelect.value;
  }

  setDefaultBaudrate(value) {
    this.baudrateSelect.value = value;
  }

  setDefaultPort(value) {
    for (let i = 0; i < this.portsSelect.children.length; i++) {
      if (this.portsSelect.children[i].value === value) {
        this.portsSelect.value = value;
        break;
      }
    }
  }

  handleOpen() {}
  handleCancel() {}

  getElement() {
    return this.element;
  }

  destroy() {
    this.element.remove();
  }
}
