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

export default class BaseView {
  constructor() {
    this.element = this.buildElement();
    this.initialize(...arguments);
  }

  /**
   * Creates an HTML element for a view.
   *
   * Subclasses must either provide a __template attribute (e.g., via
   * @withTemplate decorator) or override this method.
   */
  buildElement() {
    const templateString = fs.readFileSync(this.__template, {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    return doc.querySelector('.pio-template-root').cloneNode(true);
  }

  /**
   * Performs an initialization of a view instance.
   */
  initialize() {}

  getElement() {
    return this.element;
  }

  destroy() {
    this.element.remove();
  }
}
