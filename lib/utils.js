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

import { beginBusy, endBusy } from './services/busy';

import os from 'os';
import path from 'path';
import shell from 'shell';


export function notifyError(title, err) {
  const description = err.stack || err.toString();
  const ghbody = `# Description of problem
Leave a comment...

BEFORE SUBMITTING, PLEASE SEARCH FOR DUPLICATES IN
- https://github.com/platformio/platformio-atom-ide/issues

# Configuration
Atom: ${atom.appVersion}
PIO IDE: v${getIDEVersion()}
System: ${os.type()}, ${os.release()}, ${os.arch()}

# Exception
\`\`\`
${description}
\`\`\`
`;
  atom.notifications.addError(title, {
    buttons: [{
      text: 'Report a problem',
      onDidClick: () => openUrl(decodeURIComponent(pioNodeHelpers.misc.getErrorReportUrl(title, ghbody)))
    }],
    description,
    dismissable: true
  });
  console.error(title, err);
}

export function runAtomCommand(commandName) {
  return atom.commands.dispatch(
    atom.views.getView(atom.workspace), commandName);
}

export function runAPMCommand(args, callback, options = {}) {
  if (options.busyTitle) {
    beginBusy(options.busyTitle);
  }
  pioNodeHelpers.misc.runCommand(
    atom.packages.getApmPath(),
    ['--no-color', ...args],
    (code, stdout, stderr) => {
      if (options.busyTitle) {
        endBusy();
      }
      callback(code, stdout, stderr);
    },
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
