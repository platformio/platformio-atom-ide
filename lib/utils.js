/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from './config';
import * as pioNodeHelpers from 'platformio-node-helpers';

import path from 'path';
import querystring from 'querystring';
import shell from 'shell';


export function notifyError(title, err) {
  const detail = err.stack || err.toString();
  atom.notifications.addError(title, {
    buttons: [{
      text: 'Report a problem',
      onDidClick: () => openUrl(
        `https://github.com/platformio/platformio-atom-ide/issues/new?${querystring.stringify(
          { title: title, body: detail })}`)
    }],
    detail,
    dismissable: true
  });
  console.error(title, err);
}

export function runAtomCommand(commandName) {
  return atom.commands.dispatch(
    atom.views.getView(atom.workspace), commandName);
}

export function runAPMCommand(args, callback, options = {}) {
  pioNodeHelpers.misc.runCommand(
    atom.packages.getApmPath(),
    ['--no-color', ...args],
    callback,
    options
  );
}

export function getIDEManifest() {
  return require(path.join(config.PKG_BASE_DIR, 'package.json'));
}

export function getIDEVersion() {
  return getIDEManifest().version;
}

export function openUrl(url) {
  shell.openExternal(url);
}
