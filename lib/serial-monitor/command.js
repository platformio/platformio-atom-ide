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

import child_process from 'child_process';
import {SerialMonitorView} from './view';
import {openTerminal} from '../maintenance';

const BAUDRATE_KEY = 'platformio-ide:serial-monitor-baudrate';
const PORT_KEY = 'platformio-ide:serial-monitor-port';

export function command() {
  // Initialize view
  var view = new SerialMonitorView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  // Set buttons handlers
  view.handleCancel = () => panel.destroy();
  view.handleOpen = () => {
    localStorage.setItem(PORT_KEY, view.getPort());
    localStorage.setItem(BAUDRATE_KEY, view.getBaudrate());
    let command = `pio -f -c atom serialports monitor`;
    const settings = view.getAllSettings();
    for (let key of Object.keys(settings)) {
      command += ` --${key} ${settings[key]}`;
    }

    openTerminal(command);
    panel.destroy();
  };

  const defaultBaudrate = parseInt(localStorage.getItem(BAUDRATE_KEY) || '9600');
  view.setBaudrate(defaultBaudrate);

  return new Promise((resolve, reject) => {
    // Set ports
    const portsProcess = child_process.spawn('platformio', ['-f', '-c', 'atom', 'serialports', 'list', '--json-output']);
    let portsRawStdout = '';
    portsProcess.stdout.on('data', (chunk) => portsRawStdout += chunk);
    portsProcess.on('close', (code) => {
      if (0 !== code) {
        let title = 'PlaftormIO: Unable to get a list of serial ports.';
        atom.notifications.addError(title, {dismissable: true});
        console.error(title);
        reject();
      }
      view.setPorts(JSON.parse(portsRawStdout));
      resolve();
    });
  }).then(() => {
    // Set default port
    const defaultPort = localStorage.getItem(PORT_KEY);
    view.setDefaultPort(defaultPort);
  });
}
