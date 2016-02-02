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

export class DonateView {

  constructor() {
    // Parse template and retrieve its root element
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    this.otherLink = this.element.querySelector('.links .other');
    this.otherInputWrapper = this.element.querySelector('.input-other-wrapper');
    this.otherInput = this.element.querySelector('.input-other');
    this.goOther = this.element.querySelector('.go-other');

    this.otherLink.onclick = () => this.otherInputWrapper.style.display = 'block';
    this.otherInput.onchange = () =>
      this.goOther.href = `http://platformio.org/?amount=${this.otherInput.value}`;

    this.alreadyDonated = this.element.querySelector('.already-donated');
    this.remindLater = this.element.querySelector('.remind-later');
    this.noThanks = this.element.querySelector('.no-thanks');

    this.alreadyDonated.onclick = () => {
      this.alreadyDonatedHandler();
      this.onDone();
    }
    this.remindLater.onclick = () => {
      this.remindLaterHandler();
      this.onDone();
    }
    this.noThanks.onclick = () => {
      this.noThanksHandler();
      this.onDone();
    };
  }

  getElement() {
    return this.element;
  }

  alreadyDonatedHandler() {}
  remindLaterHandler() {}
  noThanksHandler() {}
  onDone() {}

}
