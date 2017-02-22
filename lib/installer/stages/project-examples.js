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

import * as config from '../../config';
import * as utils from '../../utils';

import { download, extractTarGz, getCacheDir } from '../util';
import BaseStage from './base';
import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';

export default class ProjectExamplesStage extends BaseStage {

  static examplesUrl = 'https://github.com/platformio/platformio-examples/tarball/master';
  static examplesDir = path.join(config.BASE_DIR, 'project-examples');
  static archivePath = path.join(getCacheDir(), 'examples.tar.gz');

  constructor() {
    super(...arguments);
    tmp.setGracefulCleanup();
  }

  get name() {
    return 'Project examples';
  }

  downloadExamples() {
    return download(
      ProjectExamplesStage.examplesUrl,
      ProjectExamplesStage.archivePath);
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
    if (utils.isDir(ProjectExamplesStage.examplesDir)) {
      try {
        fs.removeSync(ProjectExamplesStage.examplesDir);
      } catch (err) {
        console.error(err);
      }
    }
    fs.copySync(path.join(dstDir, items[0]), ProjectExamplesStage.examplesDir);
    return true;
  }

  check() {
    if (!utils.isDir(ProjectExamplesStage.examplesDir)) {
      throw new Error('Examples are not installed');
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
    }
    catch (err) {
      this.status = BaseStage.STATUS_FAILED;
      throw new Error(err);
    }
  }

}
