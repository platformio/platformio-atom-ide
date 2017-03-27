/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from './config';

import { beginBusy, endBusy } from './services/busy';

import { BufferedProcess } from 'atom';
import MemoryCache from './memory-cache';
import child_process from 'child_process';
import path from 'path';
import querystring from 'querystring';
import request from 'request';
import shell from 'shell';


let __BOARDS_CACHE = null;

export function doNothing() {
}

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
  require('./telemetry').hitException(`${title} => ${detail}`);
}

export function runCommand(cmd, args, callback, options = {}) {
  const cacheKey = MemoryCache.keyFromArgs([cmd, ...args]);
  let cache = null;
  let queueCacheKey = null;

  if (options.cacheValid) {
    cache = new MemoryCache();
    const result = cache.get(cacheKey);
    if (result !== null) {
      return callback(result.code, result.stdout, result.stderr);
    }
    queueCacheKey = cacheKey + 'queue';
    const queue = cache.get(queueCacheKey, []);
    queue.push(callback);
    cache.set(queueCacheKey, queue, '1d');
    if (queue.length > 1) {
      return;
    }
  }

  console.debug('runCommand', cmd, args, options);
  const outputLines = [];
  const errorLines = [];

  if (options.busyTitle) {
    beginBusy(cacheKey, options.busyTitle);
  }

  function onExit(code) {
    if (options.busyTitle) {
      endBusy(cacheKey, code === 0);
    }

    const stdout = outputLines.join('\n');
    const stderr = errorLines.join('\n');

    if (cache) {
      if (code === 0) {
        cache.set(cacheKey, {
          code,
          stdout,
          stderr
        }, options.cacheValid);
      }
      cache.get(queueCacheKey, []).map(cb => cb(code, stdout, stderr));
      cache.delete(queueCacheKey);
    } else {
      callback(code, stdout, stderr);
    }
  }

  return new BufferedProcess({
    command: cmd,
    args: args,
    options: options.spawnOptions,
    stdout: (line) => outputLines.push(line),
    stderr: (line) => errorLines.push(line),
    exit: (code) => onExit(code)
  }).onWillThrowError(errorObject => {
    errorObject.handle();
    errorLines.push(errorObject.error.toString());
    onExit(-1);
  });
}

export function runPIOCommand(args, callback, options = {}) {
  runCommand(
    'platformio',
    [...config.DEFAULT_PIO_ARGS, ...args],
    callback,
    options
  );
}

export function runAPMCommand(args, callback, options = {}) {
  runCommand(
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

export function getCoreVersion() {
  return new Promise((resolve, reject) => {
    runCommand(
      'platformio',
      ['--version'],
      (code, stdout, stderr) => {
        if (code === 0) {
          return resolve(stdout.trim().match(/[\d+\.]+.*$/)[0]);
        }
        return reject(stderr);
      },
      {
        cacheValid: '10s'
      }
    );
  });
}

export function processHTTPRequest(options, callback) {
  let cache = null;
  let cacheKey = null;
  if (options.cacheValid !== null) {
    cache = new MemoryCache();
    cacheKey = MemoryCache.keyFromArgs(
      [options.url, querystring.stringify(options.qs || '')]);
    const result = cache.get(cacheKey);
    if (result !== null) {
      return callback(result.error, result.response, result.body);
    }
  }

  if (!options.hasOwnProperty('headers')) {
    options.headers = {
      'User-Agent': `PlatformIOIDE/${getIDEVersion()}`
    };
  }

  console.debug('processHTTPRequest', options);
  return request(options, (err, response, body) => {
    if (!err && response.statusCode === 200 && options.cacheValid && cache) {
      cache.set(cacheKey, {
        err,
        response,
        body
      }, options.cacheValid);
    }
    return callback(err, response, body);
  });
}

export function getPioAPIResult(options, callback) {
  if (!(options.url.startsWith('http'))) {
    options.url = config.PLATFORMIO_API_ENDPOINT + options.url;
  }

  let silent = false;
  if (options.silent) {
    silent = true;
    delete options['silent'];
  }

  return processHTTPRequest(
    options,
    (err, response, body) => {
      if (!silent && err) {
        notifyError(
          'Could not connect to PlatformIO API Service. Please try later.', err);
      }
      if (!silent && !err && response.statusCode !== 200) {
        notifyError(
          'PlatformIO API Service. Invalid response. Please try later.',
          new Error(response.statusMessage));
      }
      return callback(err, response, body);
    }
  );
}

export function title(str) {
  return str[0].toUpperCase() + str.slice(1);
}

export function revealFolder(dir) {
  let cmd = '';
  let args = [];

  switch (process.platform) {
    case 'darwin':
      cmd = 'open';
      args = ['-R', dir];
      break;

    case 'win32':
      args = [`/select,"${dir}"`];
      if (process.env.SystemRoot) {
        cmd = path.join(process.env.SystemRoot, 'explorer.exe');
      } else {
        cmd = 'explorer.exe';
      }
      break;

    default:
      cmd = 'xdg-open';
      args = [dir];
  }

  runCommand(cmd, args, (code, stdout, stderr) => {
    if (code !== 0 && stderr) {
      notifyError(`Could not reveal a folder ${dir}`, new Error(stderr));
    }
  });
}

export function runAtomCommand(commandName) {
  return atom.commands.dispatch(
    atom.views.getView(atom.workspace), commandName);
}

export function openUrl(url) {
  shell.openExternal(url);
}

export function asyncDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Spaghetti */

export function removeChildrenOf(node) {
  if (!node) {
    return;
  }
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function getBoards() {
  if (!__BOARDS_CACHE) {
    const child = child_process.spawnSync('pio', config.DEFAULT_PIO_ARGS.concat(['boards', '--json-output']));
    if (0 !== child.status) {
      throw new Error('Failed to get boards');
    }
    __BOARDS_CACHE = JSON.parse(child.stdout);
  }
  return __BOARDS_CACHE;
}

export function spawnPio(args, options = {}) {
  return new Promise((resolve, reject) => {
    let stdout = '',
      stderr = '';
    const child = child_process.spawn('pio', config.DEFAULT_PIO_ARGS.concat(args), options);
    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (0 !== code) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * Annotates a view with a path to a template.
 *
 * Usage:
 *     @withTemplate(__dirname)
 *     class SomeView extends BaseView {}
 */
export function withTemplate(templateDirectory, templateFilename = 'template.html') {
  return function(target) {
    target.prototype.__template = path.resolve(templateDirectory, templateFilename);
  };
}

export function cleanMiscCache() {
  __BOARDS_CACHE = null;
}
