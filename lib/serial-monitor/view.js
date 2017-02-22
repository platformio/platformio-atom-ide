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

import {removeChildrenOf, withTemplate} from '../utils';
import BaseView from '../base-view';

@withTemplate(__dirname)
export class SerialMonitorView extends BaseView {

  initialize() {
    // Find important nodes
    this.portsSelect = this.element.querySelector('.port-select');
    this.baudrateInput = this.element.querySelector('.baudrate-input');
    this.toggleAdvancedSettings = this.element.querySelector('.toggle-advanced-settings');
    this.advancedSettings = this.element.querySelector('.advanced-settings');
    this.openButton = this.element.querySelector('.open');
    this.cancelButton = this.element.querySelector('.cancel');

    // Set handlers
    this.toggleAdvancedSettings.onclick = () => {
      const currentValue = this.advancedSettings.style.display;
      if (!currentValue || 'none' === currentValue) {
        this.advancedSettings.style.display = 'block';
      } else {
        this.advancedSettings.style.display = 'none';
      }
    };
    this.openButton.onclick = () => this.handleOpen();
    this.cancelButton.onclick = () => this.handleCancel();
  }

  setPorts(ports) {
    removeChildrenOf(this.portsSelect);

    for (let i = 0; i < ports.length; i++) {
      const option = document.createElement('option');
      option.value = ports[i].port;
      option.textContent = ports[i].description + ' at ' + ports[i].port;
      this.portsSelect.appendChild(option);
    }
  }

  setOption(optionName, optionValue) {
    const selector = `*[data-monitor-option="${optionName}"]`;
    const inputElement = this.element.querySelector(selector);
    if (!inputElement) {
      console.warn(`Element for option "${optionName}" not found.`);
      return;
    }

    if (inputElement.type === 'select') {
      // Set value only if there is option with that value.
      // Usful for port option, because the port user connected once may not
      // be present all the time.
      for (let i = 0; i < inputElement.children.length; i++) {
        if (inputElement.children[i].value === optionValue) {
          inputElement.value = optionValue;
          break;
        }
      }
    } else {
      inputElement.value = optionValue;
    }
  }

  getAllSettings() {
    const settings = {};
    const items = [].slice.call(this.element.querySelectorAll('.monitor-option'));
    for (const elem of items) {
      settings[elem.dataset.monitorOption] = elem.value;
    }
    return settings;
  }

  handleOpen() {}
  handleCancel() {}
}
