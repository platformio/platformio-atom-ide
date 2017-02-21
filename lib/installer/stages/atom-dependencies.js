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

import * as config from '../../config';
import * as utils from '../../utils';

import BaseStage from './base';
import semver from 'semver';

export default class AtomDependenciesStage extends BaseStage {

  get name() {
    return 'Atom dependencies';
  }

  getInstalled() {
    return atom.packages.getAvailablePackageNames().map(
      name => name.toLowerCase());
  }

  getMissed() {
    const installed = this.getInstalled();
    return Object.keys(config.ATOM_DEPENDENCIES).filter(
      name => installed.indexOf(name) === -1
    );
  }

  getOutdated() {
    const manifests = atom.packages.getAvailablePackageMetadata();
    const outdated = [];
    for (const manifest of manifests) {
      if (manifest.name in config.ATOM_DEPENDENCIES && !semver.satisfies(
          manifest.version, config.ATOM_DEPENDENCIES[manifest.name].version)) {
        outdated.push(manifest.name);
      }
    }
    return outdated;
  }

  getInactive() {
    const installed = this.getInstalled();
    return Object.keys(config.ATOM_DEPENDENCIES).filter(
      name => installed.indexOf(name) !== -1 && config.ATOM_DEPENDENCIES[name].required && !atom.packages.isPackageActive(name)
    );
  }

  installMissed() {
    return new Promise((resolve, reject) => {
      const missed = this.getMissed();
      if (missed.length == 0) {
        return resolve(true);
      }
      utils.runAPMCommand(
        ['install', ...missed, '--production', '--compatible'],
        (code, stdout, stderr) => {
          if (code !== 0) {
            const error = new Error(stderr);
            utils.notifyError(`Install missed packages: ${missed}`, error);
            return reject(error);
          } else {
            console.debug(stdout);
            resolve(stdout);
          }
        }
      );
    });
  }

  upgradeOutdated() {
    return new Promise((resolve, reject) => {
      const outdated = this.getOutdated();
      if (outdated.length == 0) {
        return resolve(true);
      }
      utils.runAPMCommand(
        ['upgrade', ...outdated, '--compatible', '--no-confirm'],
        (code, stdout, stderr) => {
          if (code !== 0) {
            const error = new Error(stderr);
            utils.notifyError(`Upgrade outdated packages: ${outdated}`, error);
            return reject(error);
          } else {
            console.debug(stdout);
            resolve(stdout);
          }
        }
      );
    });
  }

  activateRequired() {
    this.getInactive().forEach(name => atom.packages.enablePackage(name));
    return true;
  }

  check() {
    const missed = this.getMissed();
    if (missed.length) {
      throw new Error(`Missed packages: ${missed}`);
    }
    const outdated = this.getOutdated();
    if (outdated.length) {
      throw new Error(`Outdated packages: ${outdated}`);
    }
    const inactive = this.getInactive();
    if (inactive.length) {
      throw new Error(`Inactive packages: ${inactive}`);
    }
    this.status = BaseStage.STATUS_SUCCESSED;
    return true;
  }

  install() {
    if (this.status === BaseStage.STATUS_SUCCESSED) {
      return true;
    }
    this.status = BaseStage.STATUS_INSTALLING;
    return new Promise((resolve, reject) => {
      Promise.all([
        this.installMissed(),
        this.upgradeOutdated(),
        this.activateRequired()
      ]).then(() => {
        this.status = BaseStage.STATUS_SUCCESSED;
        resolve(true);
      }, err => {
        this.status = BaseStage.STATUS_FAILED;
        reject(err);
      });
    });
  }

}
