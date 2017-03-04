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

export function runPlatformCommand(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    let cacheValid = null;
    switch (cmd) {
      case 'search':
      case 'frameworks':
        cacheValid = '30d';
        break;
    }
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
      },
      {
        cacheValid
      }
    );
  });
}

export async function expandFrameworksOrPlatforms(what, items) {
  let data = [];
  try {
    data = await runPlatformCommand(
      what === 'frameworks' ? 'frameworks' : 'search',
      {
        extraArgs: ['--json-output'],
        silent: true
      }
    );
  } catch (err) {
    console.error(err);
  }
  if (items.length && items[0] === '*') {
    return data.map(item => {
      return {
        name: item.name,
        title: item.title
      };
    });
  }
  return items.map(name => {
    let title = utils.title(name);
    for (const d of data) {
      if (d.name === name) {
        title = d.title;
      }
    }
    return {
      name,
      title
    };
  });
}

export async function expandPackages(items) {
  const packages = await new Promise(resolve => {
    utils.getPioAPIResult(
      {
        url: '/packages',
        json: true,
        silent: true,
        cacheValid: '30d'
      },
      (err, response, body) => {
        if (err || response.statusCode !== 200) {
          return resolve(null);
        }
        resolve(body);
      }
    );
  });
  return items.map(name => {
    if (!packages || !packages.hasOwnProperty(name)) {
      return { name };
    }
    return {
      name,
      url: packages[name].url,
      description: packages[name].description
    };
  });
}
