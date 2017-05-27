/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
