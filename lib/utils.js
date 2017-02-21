'use babel';

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

import * as config from './config';

import { BufferedProcess } from 'atom';
import ContentCache from './content-cache';
import child_process from 'child_process';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import pioide from './main';
import querystring from 'querystring';
import request from 'request';
import shell from 'shell';

let __BOARDS_CACHE = null;

export function doNothing() {
}

export function notifyError(title, error) {
  atom.notifications.addError(title, {
    buttons: [{
      text: 'Report a problem',
      onDidClick: () => openUrl(
        `https://github.com/platformio/platformio-atom-ide/issues/new?${querystring.stringify(
          { title: title, body: error.toString() })}`)
    }],
    detail: error.toString(),
    dismissable: true
  });
  console.error(error);
}

export function runCommand(cmd, args, callback, cacheValid = null, spawnOptions = {}) {
  let cache = null;
  let cacheKey = null;
  let queueCacheKey = null;

  if (cacheValid) {
    cache = new ContentCache();
    cacheKey = ContentCache.keyFromArgs([cmd, ...args]);
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

  console.debug('runCommand', cmd, args, cacheValid, spawnOptions);
  const outputLines = [],
    errorLines = [];

  function onExit(code) {
    const stdout = outputLines.join('\n');
    const stderr = errorLines.join('\n');
    if (cache) {
      if (code === 0) {
        cache.set(cacheKey, {
          code,
          stdout,
          stderr
        }, cacheValid);
      }
      cache.get(queueCacheKey, []).map(cb => cb(code, stdout, stderr));
      cache.delete(queueCacheKey);
    }
    else {
      callback(code, stdout, stderr);
    }
  }

  return new BufferedProcess({
    command: cmd,
    args: args,
    options: spawnOptions,
    stdout: (line) => outputLines.push(line),
    stderr: (line) => errorLines.push(line),
    exit: (code) => onExit(code)
  }).onWillThrowError(errorObject => {
    errorObject.handle();
    errorLines.push(errorObject.error.toString());
    onExit(-1);
  });
}

export function runPIOCommand(args, callback, cacheValid = null, spawnOptions = {}) {
  runCommand(
    'platformio',
    [...config.DEFAULT_PIO_ARGS, ...args],
    callback,
    cacheValid,
    spawnOptions
  );
}

export function runAPMCommand(args, callback, cacheValid = null, spawnOptions = {}) {
  runCommand(
    atom.packages.getApmPath(),
    ['--no-color', ...args],
    callback,
    cacheValid,
    spawnOptions
  );
}

export function getIDEVersion() {
  return require(path.join(config.BASE_DIR, 'package.json')).version;
}

export function getCoreVersion(callback) {
  runCommand('platformio', ['--version'], (code, stdout, stderr) => {
    if (code === 0) {
      return callback(stdout.trim().match(/[\d+\.]+.*$/)[0]);
    }
    return callback(null, stderr);
  },
  '10s');
}

export function processHTTPRequest(options, callback, cacheValid = null) {
  let cache = null;
  let cacheKey = null;
  if (cacheValid !== null) {
    cache = new ContentCache();
    cacheKey = ContentCache.keyFromArgs(
      [options.url, querystring.stringify(options.qs ? options.qs : '')]);
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

  return request(options, (error, response, body) => {
    if (!error && response.statusCode === 200 && cacheValid && cache) {
      cache.set(cacheKey, {
        error,
        response,
        body
      }, cacheValid);
    }
    return callback(error, response, body);
  });
}

export function getPioAPIResult(options, callback, cacheValid = null) {
  if (!(options.url.startsWith('http'))) {
    options.url = config.PLATFORMIO_API_ENDPOINT + options.url;
  }
  if (!options.hasOwnProperty('json')) {
    options.json = true;
  }

  return processHTTPRequest(options, (error, response, body) => {
    if (error) {
      return notifyError(
        'Could not connect to PlatformIO API Service. Please try later.',
        error);
    }
    if (response.statusCode !== 200) {
      const error = new Error(response.statusMessage);
      return notifyError(
        'PlatformIO API Service. Invalid response. Please try later.',
        error);
    }
    return callback(error, response, body);
  },
    cacheValid);
}

export function beginBusy(identifier, text) {
  const busy = pioide.getBusyService();
  if (busy) {
    busy.begin(identifier, `PlatformIO: ${text}`);
  }
}

export function endBusy(identifier, success = true) {
  const busy = pioide.getBusyService();
  if (busy) {
    busy.end(identifier, success);
  }
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

export function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (e) {
    return false;
  }
}

export function isDir(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (e) {
    return false;
  }
}

export function internetOn() {
  return new Promise((resolve, reject) => {
    dns.lookupService('8.8.8.8', 53, (error) => {
      if (error) {
        reject(error);
      }
      else {
        resolve();
      }
    });
  });
}

export function runAtomCommand(commandName) {
  return atom.commands.dispatch(
    atom.views.getView(atom.workspace), commandName);
}

export function openUrl(url) {
  shell.openExternal(url);
}

/** Spaghetti */

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

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
