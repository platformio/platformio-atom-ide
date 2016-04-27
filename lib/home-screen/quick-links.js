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

import {runAtomCommand} from '../utils';

export class QuickLinksView {

  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('pio-home-quick-access');

    this.populateQuickLinks();
  }

  populateQuickLinks() {
    const buttonsConfigs = [
      {
        text: 'New Project',
        icon: 'plus',
        callback: () => runAtomCommand('platformio-ide:initialize-new-project'),
      },
      {
        text: 'Import Arduino Project',
        icon: 'repo',
        callback: () => runAtomCommand('platformio-ide:import-arduino-ide-project'),
      },
      {
        text: 'Open Project',
        icon: 'file-directory',
        callback: () => runAtomCommand('application:add-project-folder'),
      },
      {
        text: 'Project Examples',
        icon: 'code',
        callback: () => runAtomCommand('platformio-ide:project-examples'),
      },
    ];

    for (const config of buttonsConfigs) {
      const link = document.createElement('a');
      link.classList.add('btn');
      link.classList.add('icon');
      link.classList.add(`icon-${config.icon || 'repo'}`);

      link.href = '#';
      link.textContent = config.text;

      if (config.href) {
        link.href = config.href;
      } else if (config.callback) {
        link.onclick = config.callback;
      }

      this.element.appendChild(link);
    }
  }

  getElement() {
    return this.element;
  }

  destroy() {
    this.element.remove();
  }
}
