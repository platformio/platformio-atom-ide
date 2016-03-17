'use babel';

/**
 * Copyright (C) 2016 Ivan Kravets. All rights reserved.
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

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import tar from 'tar';
import zlib from 'zlib';
import {BASE_DIR, WIN32, DEFAULT_PIO_ARGS, NO_ELIGIBLE_PROJECTS_FOUND} from './config';

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let _pythonExecutableCached = null;
// Get the system executable
export function getPythonExecutable() {
  if (!_pythonExecutableCached) {
    let possibleExecutables;
    if (WIN32) {
      possibleExecutables = ['python.exe', 'C:\\Python27\\python.exe'];
    } else {
      possibleExecutables = ['python2.7', 'python'];
    }

    for (const executable of possibleExecutables) {
      if (isPython2(executable)) {
        _pythonExecutableCached = executable;
        break;
      }
    }

    if (!_pythonExecutableCached) {
      throw new Error('Python 2.7 could not be found.');
    }
  }
  return _pythonExecutableCached;
}

function isPython2(executable) {
  const args = ['-c', 'import sys; print \'.\'.join(str(v) for v in sys.version_info[:2])'];
  try {
    const result = child_process.spawnSync(executable, args);
    return 0 === result.status && result.stdout.toString().startsWith('2.7');
  } catch(e) {
    return false;
  }
}

export function useBuiltinPlatformIO() {
  return atom.config.get('platformio-ide.useBuiltinPlatformIO');
}

export function getIDEVersion() {
  return require(path.join(BASE_DIR, 'package.json')).version;
}

// Recursively find directory with given name
export function findFileByName(desiredFileName, where) {
  var queue = [where];
  var content, item, fullPath, stat;
  while (queue) {
    item = queue.splice(0, 1)[0];  // take the first element from the queue
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
  while(node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

/**
 * Determines an active project.
 *
 * @returns {String|Boolean} either a path of an active project,
 *  or `false` when project does not have any open projects,
 *  or NO_ELIGIBLE_PROJECTS_FOUND value, when none of open projects are proper PlatformIO projects.
 */
export function getActiveProjectPath() {
  const paths = atom.project.getPaths();
  if (0 === paths.length) {
    return false;
  }

  const editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    if (1 === paths.length && isPioProject(paths[0])) {
      return paths[0];
    } else {
      return _firstPioProjectInAList(paths);
    }
  }

  const filePath = editor.getPath();
  if (!filePath) {
    return _firstPioProjectInAList(paths);
  }

  paths.sort((a, b) => b.length - a.length);
  for (const p of paths) {
    if (filePath.startsWith(p + path.sep) && isPioProject(p)) {
      return p;
    }
  }

  return _firstPioProjectInAList(paths);
}

function _firstPioProjectInAList(list) {
  for (const p of list) {
    if (isPioProject(p)) {
      return p;
    }
  }
  return NO_ELIGIBLE_PROJECTS_FOUND;
}

let __BOARDS_CACHE;
export function getBoards() {
  if (!__BOARDS_CACHE) {
    const child = child_process.spawnSync('pio', DEFAULT_PIO_ARGS.concat(['boards', '--json-output']));
    if (0 !== child.status) {
      throw new Error('Failed to get boards');
    }
    __BOARDS_CACHE = JSON.parse(child.stdout);
  }
  return __BOARDS_CACHE;
}

export function deleteFolderRecursive(path) {
  if (!fs.statSyncNoException(path)) {
    return;
  }
  var items = fs.readdirSync(path);
  for (var i = 0; i < items.length; i++) {
    const curPath = path.join(path, items[i]);
    if (fs.lstatSync(curPath).isDirectory()) {
      deleteFolderRecursive(curPath);
    } else {
      fs.unlinkSync(curPath);
    }
  }
  fs.rmdirSync(path);
}

export function extractTargz(source, destination) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(zlib.createGunzip())
      .on('error', onError)
      .pipe(tar.Extract({ path: destination}))
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

export function spawnPio(args, options={}) {
  return new Promise((resolve, reject) => {
    let stdout = '', stderr = '';
    const child = child_process.spawn('pio', DEFAULT_PIO_ARGS.concat(args), options);
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

export function isPioProject(dir) {
  const stat = fs.statSyncNoException(path.join(dir, 'platformio.ini'));
  return stat && stat.isFile();
}
