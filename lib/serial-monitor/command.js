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

import commandJoin from 'command-join';
import {SerialMonitorView} from './view';
import {openTerminal} from '../maintenance';
import {spawnPio} from '../utils';

const BAUDRATE_KEY = 'platformio-ide:serial-monitor-baudrate';
const PORT_KEY = 'platformio-ide:serial-monitor-port';

const DEFAULT_SETTINGS = {
  baud: '9600',
  parity: 'N',
  filter: 'default',
  eol: 'CRLF',
};

export function command() {
  // Initialize view
  var view = new SerialMonitorView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  // Set buttons handlers
  view.handleCancel = () => panel.destroy();
  view.handleOpen = () => {
    localStorage.setItem(PORT_KEY, view.getPort());
    localStorage.setItem(BAUDRATE_KEY, view.getBaudrate());
    let command = ['pio', '-f', '-c', 'atom', 'serialports', 'monitor'];
    const settings = view.getAllSettings();
    for (let key of Object.keys(settings)) {
      if (typeof DEFAULT_SETTINGS[key] === 'undefined' || DEFAULT_SETTINGS[key] !== settings[key]) {
        command.push(`--${key}`);
        command.push(`${settings[key]}`);
      }
    }

    openTerminal(commandJoin(command));
    panel.destroy();
  };

  const defaultBaudrate = parseInt(localStorage.getItem(BAUDRATE_KEY) || '9600');
  view.setBaudrate(defaultBaudrate);

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
      // Set default port
      const defaultPort = localStorage.getItem(PORT_KEY);
      view.setDefaultPort(defaultPort);
    });
}
