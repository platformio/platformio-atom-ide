/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';


export function fetchBoards() {
  return new Promise((resolve, reject) => {
    utils.runPIOCommand(
      ['boards', '--json-output'],
      (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          utils.notifyError('Can not fetch embedded boards', error);
          return reject(error);
        }
        resolve(JSON.parse(stdout));
      },
      {
        cacheValid: '15m'
      }
    );
  });
}

export function fetchRegistryPackages() {
  return new Promise(resolve => {
    utils.getPioAPIResult(
      {
        url: '/packages',
        json: true,
        silent: true
      },
      (err, response, body) => {
        if (err || response.statusCode !== 200) {
          return resolve(null);
        }
        resolve(body);
      }
    );
  });
}

export function runPlatformCommand(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    let args = ['platform', cmd];
    if (options.extraArgs) {
      args = args.concat(options.extraArgs);
    }
    utils.runPIOCommand(
      args,
      (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          if (!options.silent) {
            utils.notifyError(
              `Platform command failed: ${args.join(' ')}`, error);
          }
          return reject(error);
        }
        resolve(args.includes('--json-output') ? JSON.parse(stdout) : stdout);
      }
    );
  });
}
