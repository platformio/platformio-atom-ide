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

import BaseView from '../base-view';
import {withTemplate} from '../utils';

@withTemplate(__dirname)
export class DonateView extends BaseView {

  initialize() {
    this.alreadyDonated = this.element.querySelector('.already-donated');
    this.remindLater = this.element.querySelector('.remind-later');
    this.noThanks = this.element.querySelector('.no-thanks');

    this.alreadyDonated.onclick = () => {
      this.alreadyDonatedHandler();
      this.onDone();
    };
    this.remindLater.onclick = () => {
      this.remindLaterHandler();
      this.onDone();
    };
    this.noThanks.onclick = () => {
      this.noThanksHandler();
      this.onDone();
    };
  }

  alreadyDonatedHandler() {}
  remindLaterHandler() {}
  noThanksHandler() {}
  onDone() {}
}
