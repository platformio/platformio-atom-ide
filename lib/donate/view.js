/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
