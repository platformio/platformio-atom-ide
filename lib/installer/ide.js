/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';

import semver from 'semver';


const SOURCE_MASTER_BRANCH = 'master';
const SOURCE_DEVELOP_BRANCH = 'develop';

export async function checkIDEUpdates() {
  if (!navigator.onLine) {
    return;
  }

  const branch = getSourceBranch();
  const current = utils.getIDEVersion();

  let latest = null;
  try {
    latest = await fetchLatestIDEVersion(branch);
  } catch (err) {
    console.error(err);
    return;
  }

  if (!latest || semver.lte(latest, current)) {
    return;
  }

  if (atom.config.get('platformio-ide.autoUpdateIDE')) {
    return upgradeIDE(branch);
  }

  const selected = atom.confirm({
    message: `Your PlatformIO IDE v${current} is out of date!`,
    detailedMessage: `Upgrade now to v${latest} for better performance and stability.`,
    buttons: ['Upgrade', 'Ask later']
  });
  if (selected === 0) {
    return upgradeIDE(branch);
  }
}

function getSourceBranch() {
  if (atom.config.get('platformio-ide.advanced.useDevelopmentIDE')) {
    return SOURCE_DEVELOP_BRANCH;
  }
  const manifest = utils.getIDEManifest();
  if (manifest.apmInstallSource && manifest.apmInstallSource.type === 'git') {
    return SOURCE_DEVELOP_BRANCH;
  }
  return SOURCE_MASTER_BRANCH;
}

function fetchLatestIDEVersion(branch) {
  return new Promise((resolve, reject) => {
    utils.processHTTPRequest(
      {
        url: `https://raw.githubusercontent.com/platformio/platformio-atom-ide/${branch}/package.json`
      },
      (err, response, body) => err ? reject(err) : resolve(JSON.parse(body).version)
    );
  });
}

function upgradeIDE(branch) {
  let args = null;
  switch (branch) {
    case SOURCE_DEVELOP_BRANCH:
      args = ['install', '--production', 'platformio/platformio-atom-ide'];
      break;

    case SOURCE_MASTER_BRANCH:
      args = ['upgrade', 'platformio-ide', '--compatible', '--no-confirm'];
      break;
  }
  if (!args) {
    return;
  }
  return new Promise((resolve, reject) => {
    utils.runAPMCommand(
      args,
      (code, stdout, stderr) => {
        if (code === 0) {
          atom.notifications.addSuccess(
            'The new updates for PlatformIO IDE have been installed!',
            {
              detail: 'Please restart Atom to apply the changes',
              buttons: [
                {
                  text: 'Restart',
                  onDidClick: () => atom.restartApplication()
                }
              ],
              dismissable: true
            }
          );
          return resolve(true);
        } else {
          utils.notifyError(
            'Problem occured while uprading PlatformIO IDE.',
            new Error(stderr)
          );
          return reject(stderr);
        }
      },
      {
        busyTitle: 'Upgrading PlatformIO IDE'
      }
    );
  });
}

export async function reinstallIDE(useDevelop) {
  try {
    await new Promise((resolve, reject) => {
      utils.runAPMCommand(
        ['uninstall', 'platformio-ide'],
        (code, stdout, stderr) => code === 0 ? resolve(stdout) : reject(stdout.toString() + stderr.toString()),
        {
          busyTitle: 'Uninstalling PlatformIO IDE'
        }
      );
    });
    await new Promise((resolve, reject) => {
      utils.runAPMCommand(
        [
          'install',
          '--production',
          useDevelop ? 'platformio/platformio-atom-ide' : 'platformio-ide'
        ],
        (code, stdout, stderr) => code === 0 ? resolve(stdout) : reject(stdout.toString() + stderr.toString()),
        {
          busyTitle: 'Installing PlatformIO IDE'
        }
      );
    });

  } catch (err) {
    utils.notifyError(
      'Problem has been occured while installing PlatformIO IDE.',
      new Error(err)
    );
    return false;
  }

  atom.notifications.addSuccess(
    'PlatformIO IDE has been successfully installed!',
    {
      detail: 'Please restart Atom to apply the changes',
      buttons: [
        {
          text: 'Restart',
          onDidClick: () => atom.restartApplication()
        }
      ],
      dismissable: true
    }
  );
  return true;
}
