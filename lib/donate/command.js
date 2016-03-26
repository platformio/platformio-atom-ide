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

import {DonateView} from './view';

const ENABLED_KEY = 'platformio-ide:donate:auto-popup-enabled';
const COUNTER_KEY = 'platformio-ide:donate:conter';
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
