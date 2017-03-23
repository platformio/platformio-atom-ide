/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {SerialMonitorView} from './view';
import commandJoin from 'command-join';
import { runCmdsInTerminal } from '../terminal';
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
    const command = ['pio', 'device', 'monitor'];
    const settings = view.getAllSettings();
    const storedSettings = new Map();
    for (const key of Object.keys(settings)) {
      if (typeof DEFAULT_SETTINGS[key] === 'undefined' || DEFAULT_SETTINGS[key] !== settings[key]) {
        command.push(`--${key}`);
        command.push(`${settings[key]}`);
        storedSettings.set(key, settings[key]);
      }
    }

    runCmdsInTerminal([commandJoin(command)]);
    panel.destroy();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(Array.from(storedSettings.entries())));
  };

  return spawnPio(['device', 'list', '--json-output'])
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
