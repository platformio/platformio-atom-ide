/** @babel */

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

import * as config from '../config';
import * as utils from '../utils';

import fs from 'fs-extra';
import path from 'path';
import request from 'request';
import semver from 'semver';
import tar from 'tar';
import zlib from 'zlib';

export function getCacheDir() {
  if (!utils.isDir(config.CACHE_DIR)) {
    fs.mkdirSync(config.CACHE_DIR);
  }
  return config.CACHE_DIR;
}

export async function download(source, target) {
  // check if file is already downloaded
  if (utils.isFile(target)) {
    const contentLength = await getContentLength(source);
    const stat = fs.statSync(target);
    if (contentLength > 0 && stat.size === contentLength) {
      return target;
    }
    try {
      fs.removeSync(target);
    } catch (err) {
      console.error(err);
    }
  }

  return new Promise((resolve, reject) => {
    utils.runAPMCommand(
      ['config', 'get', 'https-proxy'],
      (code, stdout, stderr) => {
        if (code !== 0) {
          return reject(`Could not get proxy from APM: ${stderr}`);
        }
        const proxy = stdout.trim();
        const file = fs.createWriteStream(target);
        const options = {
          url: source
        };
        if (proxy !== 'null') {
          options.proxy = proxy;
        }
        request.get(options)
          .on('error', err => reject(err))
          .pipe(file);
        file.on('error', err => reject(err));
        file.on('finish', () => resolve(target));
      },
      '1h'
    );
  });
}

export function getContentLength(url) {
  return new Promise(resolve => {
    request.head({
      url
    }, (err, response) => {
      if (err || response.statusCode !== 200 || !response.headers.hasOwnProperty('content-length')) {
        resolve(-1);
      }
      resolve(parseInt(response.headers['content-length']));
    });
  });
}

export function extractTarGz(source, destination) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(zlib.createGunzip())
      .on('error', err => reject(err))
      .pipe(tar.Extract({
        path: destination
      }))
      .on('error', err => reject(err))
      .on('end', () => resolve(destination));
  });
}

export async function getPythonExecutable(customDirs = null) {
  const candidates = new Set();
  const defaultName = config.IS_WINDOWS ? 'python.exe' : 'python';

  if (customDirs) {
    customDirs.forEach(dir => candidates.add(path.join(dir, defaultName)));
  }

  if (atom.config.get('platformio-ide.useBuiltinPIOCore')) {
    candidates.add(path.join(config.ENV_BIN_DIR, defaultName));
  }

  if (config.IS_WINDOWS) {
    candidates.add(defaultName);
    candidates.add('C:\\Python27\\' + defaultName);
  } else {
    candidates.add('python2.7');
    candidates.add(defaultName);
  }

  for (const item of process.env.PATH.split(path.delimiter)) {
    if (utils.isFile(path.join(item, defaultName))) {
      candidates.add(path.join(item, defaultName));
    }
  }

  for (const executable of candidates.values()) {
    if ((await isPython2(executable))) {
      return executable;
    }
  }

  return null;
}

function isPython2(executable) {
  const args = ['-c', 'import sys; print \'.\'.join(str(v) for v in sys.version_info[:2])'];
  return new Promise(resolve => {
    utils.runCommand(
      executable, args, (code, stdout) => {
        resolve(code === 0 && stdout.startsWith('2.7'));
      },
      '1d'
    );
  });
}

export function reinstallPIOCore() {
  if (utils.isDir(config.ENV_DIR)) {
    try {
      fs.removeSync(config.ENV_DIR);
    } catch (err) {
      console.error(err);
    }
  }
  atom.notifications.addWarning(
    'PlatformIO Core has been uninstalled!',
    {
      detail: 'Please restart Atom to install appropriate version',
      buttons: [
        {
          text: 'Restart',
          onDidClick: () => atom.restartApplication()
        }
      ],
      dismissable: true
    }
  );
}

export function checkDevelopmentUpdates() {
  utils.internetOn().then(() => {
    // utils.runPIOCommand(
    //   ['upgrade'],
    //   (code, stdout, stderr) => console.debug('PIO Core Upgrade', code, stdout, stderr)
    // );

    const current = utils.getIDEVersion();
    if (!semver.prerelease(current)) {
      return;
    }

    utils.processHTTPRequest(
      {
        url: 'https://raw.githubusercontent.com/platformio/platformio-atom-ide/develop/package.json'
      },
      (error, response, body) => {
        if (error) {
          return;
        }
        const latest = JSON.parse(body).version;
        if (semver.gt(latest, current)) {
          atom.confirm({
            message: `Your PlatformIO IDE v${current} is out of date!`,
            detailedMessage: `Upgrade now to v${latest} for better performance and stability.`,
            buttons: {
              'Upgrade': () => upgradePIOIDEDev(),
              'Ask later': () => {
              }
            }
          });
        }
      }
    );

  });
}

export function upgradePIOIDEDev() {
  const busyId = 'pio-ide-upgrade';
  utils.beginBusy(busyId, 'Upgrading PlatformIO IDE...');
  utils.runAPMCommand(
    ['install', '--production', 'platformio/platformio-atom-ide'],
    (code, stdout, stderr) => {
      utils.endBusy(busyId, code === 0);
      if (code === 0) {
        atom.notifications.addSuccess(
          'PlatformIO IDE has been successfully upgraded!',
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
      } else {
        return utils.notifyError(
          'Could not upgrade PlatformIO IDE to the latest development version.',
          new Error(stderr));
      }
    }
  );
}
