'use babel';

/**
 * Copyright 2016-present Ivan Kravets <me@ikravets.com>
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

import {SerialMonitorView} from './view';
import commandJoin from 'command-join';
import {openTerminal} from '../maintenance';
import {spawnPio} from '../utils';

const SETTINGS_KEY = 'platformio-ide:serial-monitor-settings';

const DEFAULT_SETTINGS = {
  baud: '9600',
  parity: 'N',
  filter: 'default',
  encoding: 'UTF-8',
  eol: 'CRLF',
  dtr: '-',
  rts: '-',
  raw: '-',
  echo: '-'
};

export function command() {
  // Initialize view
  var view = new SerialMonitorView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  // Set buttons handlers
  view.handleCancel = () => panel.destroy();
  view.handleOpen = () => {
    const command = ['pio', '-f', '-c', 'atom', 'serialports', 'monitor'];
    const settings = view.getAllSettings();
    const storedSettings = new Map();
    for (const key of Object.keys(settings)) {
      if (typeof DEFAULT_SETTINGS[key] === 'undefined' || DEFAULT_SETTINGS[key] !== settings[key]) {
        command.push(`--${key}`);
        command.push(`${settings[key]}`);
        storedSettings.set(key, settings[key]);
      }
    }

    openTerminal(commandJoin(command));
    panel.destroy();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(Array.from(storedSettings.entries())));
  };

  return spawnPio(['serialports', 'list', '--json-output'])
    .then(function onSuccess(output) {
      view.setPorts(JSON.parse(output));
    }, function onFailure(reason) {
      const title = 'PlaftormIO: Unable to get a list of serial ports.';
      atom.notifications.addError(title, {dismissable: true});
      console.error(title);
      return Promise.reject(reason);
    })
    .then(() => {
      let restoredSettings = null;
      try {
        restoredSettings = new Map(JSON.parse(localStorage.getItem(SETTINGS_KEY)));
      } catch(e) {
        console.warn('Error restoring Serial Monitor settings: ' + e);
        restoredSettings = new Map();
      }

      restoredSettings.forEach((value, key) => view.setOption(key, value));
    });
}
