/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from '../../config';
import * as pioNodeHelpers from 'platformio-node-helpers';
import * as utils from '../../utils';

import semver from 'semver';


const BaseStage = pioNodeHelpers.installer.BaseStage;

export default class AtomDependenciesStage extends BaseStage {

  static MAX_FAILURES_COUNT = 3;

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
      name => !installed.includes(name)
    );
  }

  getIncompatible() {
    const manifests = atom.packages.getAvailablePackageMetadata();
    const incompatible = [];
    for (const manifest of manifests) {
      if (manifest.name in config.ATOM_DEPENDENCIES && !semver.satisfies(
          manifest.version, config.ATOM_DEPENDENCIES[manifest.name].requirements)) {
        incompatible.push(manifest.name);
      }
    }
    return incompatible;
  }

  getConflicted() {
    const manifests = atom.packages.getAvailablePackageMetadata();
    const conflicted = [];
    for (const manifest of manifests) {
      if (
        manifest.name in config.ATOM_CONFLICTED_DEPENDENCIES
        && semver.satisfies(manifest.version, config.ATOM_CONFLICTED_DEPENDENCIES[manifest.name].requirements)
        && atom.packages.isPackageActive(manifest.name)
      ) {
        conflicted.push(manifest.name);
      }
    }
    return conflicted;
  }

  getInactive() {
    const installed = this.getInstalled();
    return Object.keys(config.ATOM_DEPENDENCIES).filter(
      name => installed.includes(name) && config.ATOM_DEPENDENCIES[name].required && !atom.packages.isPackageActive(name)
    );
  }

  async installMissed() {
    let missed = this.getMissed();
    if (missed.length == 0) {
      return true;
    }
    missed = missed.map(name => {
      if (!config.ATOM_DEPENDENCIES[name].forceVersion) {
        return name;
      }
      return `${name}@${config.ATOM_DEPENDENCIES[name].forceVersion}`;
    });

    try {
      await this._installMissedByNames(missed);
    } catch (err) {
      await this._installMissedOneByOne(missed);
    }
  }

  _installMissedByNames(missed) {
    return new Promise((resolve, reject) => {
      utils.runAPMCommand(
        ['install', ...missed, '--production', '--compatible'],
        (code, stdout, stderr) => {
          if (code !== 0) {
            const error = new Error(stderr);
            return reject(error);
          } else {
            console.info(stdout);
            resolve(stdout);
          }
        }
      );
    });
  }

  async _installMissedOneByOne(missed) {
    let failuresCount = 0;
    while (missed.length > 0) {
      const name = missed.shift();
      try {
        await this._installMissedByNames([name]);
      } catch (err) {
        failuresCount++;
        missed.push(name);

        if (failuresCount >= this.MAX_FAILURES_COUNT) {
          utils.notifyError(`Failed to install missed packages: ${missed}`, err);
          throw new Error(err.toString());
        }
      }
    }
  }

  uninstallIncompatible() {
    return new Promise((resolve, reject) => {
      const incompatible = this.getIncompatible();
      if (incompatible.length == 0) {
        return resolve(true);
      }

      utils.runAPMCommand(
        ['uninstall', ...incompatible],
        (code, stdout, stderr) => {
          if (code !== 0) {
            const error = new Error(stderr);
            utils.notifyError(`Uninstall incompatible packages: ${incompatible}`, error);
            return reject(error);
          } else {
            console.info(stdout);
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

  disableConflicted() {
    this.getConflicted().forEach(name => atom.packages.disablePackage(name));
    return true;
  }

  check() {
    const missed = this.getMissed();
    if (missed.length) {
      throw new Error(`Missed packages: ${missed}`);
    }
    const incompatible = this.getIncompatible();
    if (incompatible.length) {
      throw new Error(`Incompatible packages: ${incompatible}`);
    }
    const conflicted = this.getConflicted();
    if (conflicted.length) {
      throw new Error(`Conflicted packages: ${conflicted}`);
    }
    const inactive = this.getInactive();
    if (inactive.length) {
      throw new Error(`Inactive packages: ${inactive}`);
    }
    this.status = BaseStage.STATUS_SUCCESSED;
    return true;
  }

  async install() {
    if (this.status === BaseStage.STATUS_SUCCESSED) {
      return true;
    }
    this.status = BaseStage.STATUS_INSTALLING;
    try {
      await this.uninstallIncompatible();
      await this.installMissed();
      await this.activateRequired();
      await this.disableConflicted();
    } catch (err) {
      this.status = BaseStage.STATUS_FAILED;
      throw new Error(err.toString());
    }
    return true;
  }

}
