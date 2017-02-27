/** @babel */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as utils from '../utils';


export function getBoards() {
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
        cacheValid: '1d'
      }
    );
  });
}

export function getAllPlatforms() {
  return new Promise((resolve, reject) => {
    utils.runPIOCommand(
      ['platform', 'search', '--json-output'],
      (code, stdout, stderr) => {
        if (code !== 0) {
          reject(stderr);
        } else {
          resolve(JSON.parse(stdout));
        }
      },
      {
        cacheValid: '30d'
      }
    );
  });
}

export function getAllFrameworks() {
  return new Promise((resolve, reject) => {
    utils.runPIOCommand(
      ['platform', 'frameworks', '--json-output'],
      (code, stdout, stderr) => {
        if (code !== 0) {
          reject(stderr);
        } else {
          resolve(JSON.parse(stdout));
        }
      },
      {
        cacheValid: '30d'
      }
    );
  });
}
