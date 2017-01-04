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
import {BufferedProcess} from 'atom';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import pioide from './main';
import promisify from 'promisify-node';
import querystring from 'querystring';
import request from 'request';
import shell from 'shell';
import tar from 'tar';
import zlib from 'zlib';

const fsp = promisify('fs');


let __PYTHON_EXE_CACHE = null;
let __BOARDS_CACHE = null;

class ContentCache {

  static instance = null;
  static tdmap = {
    's': 1,
    'm': 60,
    'h': 3600,
    'd': 86400
  };

  constructor() {
    if (ContentCache.instance) {
      return ContentCache.instance;
    }
    ContentCache.instance = this;
    this._storage = new Map();
    setInterval(() => this._cleanOutdated(), 3600 * 1000);
    return ContentCache.instance;
  }

  _cleanOutdated() {
    const now = new Date().getTime();
    for (const [key, value] of this._storage.entries()) {
      if (value.expire < now) {
        this._storage.delete(key);
      }
    }
  }

  static keyFromArgs(...args) {
    return args.join();
  }

  get(key) {
    if (!this._storage.has(key)) {
      return null;
    }
    const item = this._storage.get(key);
    if (item.expire < new Date().getTime()) {
      return null;
    }
    return item.data;
  }

  set(key, data, valid) {
    let expire = parseInt(valid.slice(0, -1));
    expire *= ContentCache.tdmap[valid.slice(-1)];
    expire *= 1000; // ms
    expire += new Date().getTime();
    this._storage.set(key, {
      data,
      expire
    });
  }

}

export function notifyError(title, error) {
  atom.notifications.addError(title, {
    buttons: [{
      text: 'Report a problem',
      onDidClick: () => shell.openExternal(
        `https://github.com/platformio/platformio-atom-ide/issues/new?${querystring.stringify(
          { title: title, body: error.toString() })}`)
    }],
    detail: error.toString(),
    dismissable: true
  });
  console.error(error);
}

export function runCommand(cmd, args, callback, cacheValid = null, spawnOptions = null) {
  let cache = null;
  let cacheKey = null;
  if (cacheValid) {
    cache = new ContentCache();
    cacheKey = ContentCache.keyFromArgs([cmd, ...args]);
    const result = cache.get(cacheKey);
    if (result !== null) {
      return callback(result.code, result.stdout, result.stderr);
    }
  }

  console.debug('runCommand', cmd, args, cacheValid, spawnOptions);
  const outputLines = [],
    errorLines = [];
  new BufferedProcess({
    command: cmd,
    args: args,
    options: spawnOptions,
    stdout: (line) => outputLines.push(line),
    stderr: (line) => errorLines.push(line),
    exit: (code) => {
      const stdout = outputLines.join('\n');
      const stderr = errorLines.join('\n');
      if (code === 0 && cacheValid && cache) {
        cache.set(cacheKey, {
          code,
          stdout,
          stderr
        }, cacheValid);
      }
      return callback(code, stdout, stderr);
    }
  });
}

export function runPIOCommand(args, callback, cacheValid = null, spawnOptions = null) {
  runCommand(
    'platformio', [...config.DEFAULT_PIO_ARGS, ...args], callback,
    cacheValid, spawnOptions
  );
}

export function getIDEVersion() {
  return require(path.join(config.BASE_DIR, 'package.json')).version;
}

export function getCoreVersion(callback) {
  runCommand('platformio', ['--version'], (code, stdout, stderr) => {
    if (code === 0) {
      return callback(null, stdout.trim().match(/[\d+\.]+.*$/)[0]);
    }
    return callback(stderr);
  });
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
    if (response.statusCode === 200 && cacheValid && cache) {
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
  const busy = pioide.getBusyRegister();
  if (busy) {
    busy.begin(identifier, `PlatformIO: ${text}`);
  }
}

export function endBusy(identifier, success = true) {
  const busy = pioide.getBusyRegister();
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

/** Spaghetti */

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Get the system executable
export function getPythonExecutable() {
  if (!__PYTHON_EXE_CACHE) {
    const possibleExecutables = [];
    if (useBuiltinPlatformIO()) {
      possibleExecutables.push(path.join(config.ENV_BIN_DIR, 'python'));
    }

    if (config.IS_WINDOWS) {
      possibleExecutables.push('python.exe');
      possibleExecutables.push('C:\\Python27\\python.exe');
    } else {
      possibleExecutables.push('python2.7');
      possibleExecutables.push('python');
    }

    for (const executable of possibleExecutables) {
      if (isPython2(executable)) {
        __PYTHON_EXE_CACHE = executable;
        break;
      }
    }

    if (!__PYTHON_EXE_CACHE) {
      throw new Error('Python 2.7 could not be found.');
    }
  }
  return __PYTHON_EXE_CACHE;
}

function isPython2(executable) {
  const args = ['-c', 'import sys; print \'.\'.join(str(v) for v in sys.version_info[:2])'];
  try {
    const result = child_process.spawnSync(executable, args);
    return 0 === result.status && result.stdout.toString().startsWith('2.7');
  } catch (e) {
    return false;
  }
}

export function useBuiltinPlatformIO() {
  return atom.config.get('platformio-ide.useBuiltinPlatformIO');
}

// Recursively find directory with given name
export function findFileByName(desiredFileName, where) {
  var queue = [where];
  var content,
    item,
    fullPath,
    stat;
  while (queue) {
    item = queue.splice(0, 1)[0]; // take the first element from the queue
    content = fs.readdirSync(item);
    for (var i = 0; i < content.length; i++) {
      fullPath = path.join(item, content[i]);
      stat = fs.statSyncNoException(fullPath);
      if (!stat) {
        continue;
      }

      if (stat.isFile() && content[i] === desiredFileName) {
        return fullPath;
      } else if (stat.isDirectory()) {
        queue.push(fullPath);
      }
    }
  }
  return -1;
}

export function runAtomCommand(commandName) {
  return atom.commands.dispatch(
    atom.views.getView(atom.workspace), commandName);
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

export function extractTargz(source, destination) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(zlib.createGunzip())
      .on('error', onError)
      .pipe(tar.Extract({
        path: destination
      }))
      .on('error', onError)
      .on('end', () => resolve());

    function onError(err) {
      reject(err);
    }
  });
}

/*
 * Locate a package in atom package directories.
 *
 * atom.packages.resolvePackagePath() works incorrectly when provided name is
 * an existing directory. When there is package named pkg atom.packages.resolvePackagePath('pkg')
 * and there is a directory named 'pkg' in current working directory, returned value
 * will be 'pkg', which is basically a releative path to the 'pkg' directory form CWD.
 */
export function resolveAtomPackagePath(name) {
  for (const dir of atom.packages.getPackageDirPaths()) {
    const fullPath = path.join(dir, name);
    if (fs.statSyncNoException(fullPath)) {
      return fullPath;
    }
  }
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

export async function isFile(filePath) {
  try {
    const stat = await fsp.stat(filePath);
    return stat.isFile();
  } catch (e) {
    return false;
  }
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
  __PYTHON_EXE_CACHE = null;
}
