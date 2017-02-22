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

import {DonateView} from './view';

const ENABLED_KEY = 'platformio-ide:donate:auto-popup-enabled2';
const COUNTER_KEY = 'platformio-ide:donate:counter';
const DEFAULT_DELAY = '13';

export function command(respectCounter) {
  if (respectCounter) {
    const enabled = Boolean(parseInt(localStorage.getItem(ENABLED_KEY) || '1'));
    if (!enabled) {
      return;
    }
    const counter = parseInt(localStorage.getItem(COUNTER_KEY) || DEFAULT_DELAY);
    if (counter > 1) {
      localStorage.setItem(COUNTER_KEY, (counter - 1).toString());
      return;
    }
  }

  const view = new DonateView();
  const panel = atom.workspace.addModalPanel({item: view.getElement()});

  const disablePopup = () => {
    localStorage.setItem(ENABLED_KEY, '0');
  };

  view.alreadyDonatedHandler = disablePopup;
  view.remindLaterHandler = () => {
    localStorage.setItem(COUNTER_KEY, DEFAULT_DELAY);
    localStorage.setItem(ENABLED_KEY, '1');
  };
  view.noThanksHandler = disablePopup;
  view.onDone = () => panel.destroy();
}
