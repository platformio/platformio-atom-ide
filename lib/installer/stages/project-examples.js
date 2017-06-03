/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from '../../config';
import * as utils from '../../utils';

import { download, extractTarGz, getCacheDir } from '../helpers';
import BaseStage from './base';
import fs from 'fs-plus';
import path from 'path';
import semver from 'semver';
import tmp from 'tmp';


export default class ProjectExamplesStage extends BaseStage {

  static CHECK_EXAMPLES_TIMEOUT = 86400 * 1000; // 1 day

  static ARCHIVE_DOWNLOAD_URL = 'https://github.com/platformio/platformio-examples/tarball/master';
  static ARCHIVE_CACHE_PATH = path.join(getCacheDir(), 'examples.tar.gz');
  static DESTINATION_DIR = path.join(config.PIO_HOME_DIR, 'project-examples');

  constructor() {
    super(...arguments);
    tmp.setGracefulCleanup();
  }

  get name() {
    return 'Project examples';
  }

  downloadExamples() {
    return download(
      ProjectExamplesStage.ARCHIVE_DOWNLOAD_URL,
      ProjectExamplesStage.ARCHIVE_CACHE_PATH);
  }

  async unpackExamples(targzPath) {
    const tmpDir = tmp.dirSync({
      unsafeCleanup: true
    });
    const dstDir = await extractTarGz(targzPath, tmpDir.name);
    const items = fs.readdirSync(dstDir);
    if (items.length !== 1) {
      throw new Error('Examples archive should contain single directory');
    }
    if (fs.isDirectorySync(ProjectExamplesStage.DESTINATION_DIR)) {
      try {
        fs.removeSync(ProjectExamplesStage.DESTINATION_DIR);
      } catch (err) {
        console.error(err);
      }
    }
    fs.copySync(path.join(dstDir, items[0]), ProjectExamplesStage.DESTINATION_DIR);
    return true;
  }

  getLatestExamplesVersion() {
    return new Promise(resolve => {
      utils.processHTTPRequest(
        {
          url: 'https://api.github.com/repos/platformio/platformio-examples/releases/latest'
        },
        (err, response, body) => {
          if (err) {
            console.error(err);
            return resolve(null);
          }
          try {
            return resolve(JSON.parse(body).name);
          } catch (err) {
            console.error(err);
          }
          return resolve(null);
        }
      );
    });
  }

  initState() {
    let state = this.state;
    if (!state || !state.hasOwnProperty('checked') || !state.hasOwnProperty('version')) {
      state = {
        checked: 0,
        version: null
      };
    }
    return state;
  }

  async isOutdatedExamples() {
    const now = new Date().getTime();
    const newState = this.initState();
    if ((now - ProjectExamplesStage.CHECK_EXAMPLES_TIMEOUT) < parseInt(newState.checked)) {
      return false;
    }
    // update checked time
    newState.checked = now;
    this.state = newState;

    const latestVersion = await this.getLatestExamplesVersion();
    if (!latestVersion) {
      return false;
    }
    const currentVersion = newState.version;
    newState.version = latestVersion;
    this.state = newState;
    return currentVersion && semver.gt(latestVersion, currentVersion);
  }

  async check() {
    if (!fs.isDirectorySync(ProjectExamplesStage.DESTINATION_DIR)) {
      throw new Error('Examples are not installed');
    }
    if (await this.isOutdatedExamples()) {
      if (fs.isFileSync(ProjectExamplesStage.ARCHIVE_CACHE_PATH)) {
        try {
          fs.removeSync(ProjectExamplesStage.ARCHIVE_CACHE_PATH);
        } catch (err) {
          console.error(err);
        }
      }
      throw new Error('Examples are outdated');
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
      await this.unpackExamples(await this.downloadExamples());
      this.status = BaseStage.STATUS_SUCCESSED;
      return true;
    } catch (err) {
      this.status = BaseStage.STATUS_FAILED;
      throw new Error(err);
    }
  }

}
