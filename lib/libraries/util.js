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

import * as utils from '../utils';

export function loadLibRegistryStats() {
  return new Promise((resolve, reject) => {
    utils.runPIOCommand(
      ['lib', 'stats', '--json-output'],
      (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          utils.notifyError('Could not load library statistics', error);
          reject(error);
        }
        resolve(JSON.parse(stdout));
      },
      '1h'
    );
  });
}

export function loadLibRegistrySearchResults(query, page = 1) {
  return new Promise((resolve, reject) => {
    utils.runPIOCommand(
      ['lib', 'search', query, '--page', page, '--json-output'],
      (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          utils.notifyError('Could not load library search results', error);
          reject(error);
        }
        resolve(JSON.parse(stdout));
      },
      '3d'
    );
  });
}

export function loadLibRegistryShowResult(id) {
  return new Promise((resolve, reject) => {
    utils.runPIOCommand(
      ['lib', 'show', id, '--json-output'],
      (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          utils.notifyError('Could not load library information', error);
          reject(error);
        }
        resolve(JSON.parse(stdout));
      },
      '1d'
    );
  });
}

export function installLibrary(lib, path) {
  return new Promise((resolve, reject) => {
    const busyId = `lib-uninstall-${lib}`;
    utils.beginBusy(busyId, `Installing library #${lib}`);
    utils.runPIOCommand(
      ['lib', ...(path ? ['--storage-dir', path] : ['--global']), 'install', lib],
      (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          utils.beginBusy(busyId, false);
          utils.notifyError(
            `Could not install library #${lib} to ${path}`, new Error(stderr));
          reject(error);
        }
        utils.endBusy(busyId, true);
        atom.notifications.addSuccess(
          'Library has been successfully installed', {
            detail: stdout,
            dismissable: true
          }
        );
        resolve(stdout);
      }
    );
  });
}

export function uninstallLibrary(lib, path) {
  return new Promise((resolve, reject) => {
    const busyId = `lib-uninstall-${lib}`;
    utils.beginBusy(busyId, `Uninstalling library ${lib}`);
    utils.runPIOCommand(
      ['lib', ...(path ? ['--storage-dir', path] : ['--global']), 'uninstall', lib],
      (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          utils.beginBusy(busyId, false);
          utils.notifyError(
            `Could not uninstall library ${lib} to ${path}`, new Error(stderr));
          reject(error);
        }
        utils.endBusy(busyId, true);
        atom.notifications.addSuccess(
          'Library has been successfully uninstalled', {
            detail: stdout,
            dismissable: true
          }
        );
        resolve(stdout);
      }
    );
  });
}

export function loadInstalledLibraries(path) {
  return new Promise((resolve, reject) => {
    utils.runPIOCommand(
      ['lib', ...(path ? ['--storage-dir', path] : ['--global']), 'list', '--json-output'],
      (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          utils.notifyError(
            `Could not load installed libraries in ${path}`, new Error(stderr));
          reject(error);
        }
        resolve(JSON.parse(stdout));
      }
    );
  });
}
