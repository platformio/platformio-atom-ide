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

import path from 'path';
import child_process from 'child_process';
import {SerialMonitorView} from './view';
import {openTerminal} from '../maintenance';
import {WIN32, DARWIN, ENV_BIN_DIR} from '../constants';

export function command() {
  // Initialize view
  var view = new SerialMonitorView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  // Set buttons handlers
  view.handleCancel = () => panel.destroy();
  view.handleOpen = () => {
    let command;
    if (WIN32) {
      command = `platformio serialports monitor -p ${view.getPort()} -b ${view.getBaudrate()}`;
    } else {
      let fullPIOPath = path.join(ENV_BIN_DIR, 'platformio');
      if (DARWIN) {
        command = `script /dev/null "${fullPIOPath}" serialports monitor ` +
                  `-p ${view.getPort()} -b ${view.getBaudrate()}`;
      } else {
        command = `script -c "${fullPIOPath} serialports monitor ` +
                  `-p ${view.getPort()} -b ${view.getBaudrate()}" /dev/null`;
      }
    }
    openTerminal(command);
    panel.destroy();
  };

  // Set ports
  const portsProcess = child_process.spawn('platformio', ['serialports', 'list', '--json-output']);
  let portsRawStdout = '';
  portsProcess.stdout.on('data', (chunk) => portsRawStdout += chunk);
  portsProcess.on('close', (code) => {
    if (0 !== code) {
      let title = 'PlaftormIO: Unable to get a list of serial ports.';
      atom.notifications.addError(title);
      console.error(title);
      return;
    }
    view.setPorts(JSON.parse(portsRawStdout));
  });
}
