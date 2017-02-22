'use babel';

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
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
