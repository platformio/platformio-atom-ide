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

import { download, extractTarGz, getCacheDir, getPythonExecutable } from '../util';
import BaseStage from './base';
import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import tmp from 'tmp';

export default class PlatformIOCoreStage extends BaseStage {

  static vitrualenvUrl = 'https://pypi.python.org/packages/source/v/virtualenv/virtualenv-14.0.6.tar.gz';
  static virtualenvArhivePath = path.join(getCacheDir(), 'virtualenv.tar.gz');

  constructor() {
    super(...arguments);
    tmp.setGracefulCleanup();
  }

  get name() {
    return 'PlatformIO Core';
  }

  async whereIsPython() {
    let pythonExecutable = null;
    let buttonIndex = 0;
    do {
      pythonExecutable = await getPythonExecutable();
      if (pythonExecutable) {
        return pythonExecutable;
      }
      buttonIndex = atom.confirm({
        message: 'PlatformIO: Can not find Python 2.7 Interpreter',
        detailedMessage: 'PlatformIO Core is written in Python and depends on it. ' +
          'Please install Python 2.7 (PYTHON 3 IS NOT SUPPORTED YET) or ' +
          'if you have it, please choose a directory where "python/python.exe" program is located.',
        buttons: [
          'Install Python 2.7',
          'I have Python 2.7',
          'Try again',
          'Abort PlatformIO IDE Installation'
        ]
      });

      switch (buttonIndex) {
        case 0:
          utils.openUrl('http://docs.platformio.org/page/ide/atom.html#installation');
          break;

        case 1:
          pythonExecutable = await getPythonExecutable(await this.chooseCustomPythonDirs());
          if (pythonExecutable) {
            return pythonExecutable;
          }
          break;
      }

    } while (buttonIndex !== 3);
    return null;
  }

  chooseCustomPythonDirs() {
    return new Promise((resolve) => {
      atom.pickFolder(paths => {
        resolve(paths);
      });
    });
  }

  downloadVirtualenv() {
    return download(
      PlatformIOCoreStage.vitrualenvUrl,
      PlatformIOCoreStage.virtualenvArhivePath);
  }

  findFileByName(desiredFileName, where) {
    const queue = [where];
    let content,
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
    return null;
  }

  createVirtualenv(pythonExecutable) {
    return new Promise((resolve, reject) => {
      if (utils.isDir(config.ENV_DIR)) {
        fs.removeSync(config.ENV_DIR);
      }
      // try to create with built-in virtualenv (if it is installed)
      utils.runCommand(
        config.IS_WINDOWS ? 'virtualenv.exe' : 'virtualenv',
        ['-p', pythonExecutable, config.ENV_DIR],
        (code, stdout) => {
          if (code === 0) {
            return resolve(stdout);
          } else {
            // virtualenv is not installed or cmd failed
            // download own version of virtualenv
            this.downloadVirtualenv().then(archivePath => {
              const tmpDir = tmp.dirSync({
                unsafeCleanup: true
              });
              extractTarGz(archivePath, tmpDir.name).then(dstDir => {
                const virtualenvScript = this.findFileByName('virtualenv.py', dstDir);
                if (!virtualenvScript) {
                  return reject('Can not find virtualenv.py script');
                }
                utils.runCommand(
                  pythonExecutable,
                  [virtualenvScript, config.ENV_DIR],
                  (code, stdout, stderr) => {
                    if (code === 0) {
                      return resolve(stdout);
                    } else {
                      return reject(`Virtualenv: ${stderr}`);
                    }
                  }
                );
              });
            }).catch(err => reject(`Virtualenv: ${err}`));
          }
        }
      );
    });
  }

  installPIOCore() {
    return new Promise((resolve, reject) => {
      const args = ['install', '--no-cache-dir', '-U'];
      if (atom.config.get('platformio-ide.useDevelopmentPIOCore') || semver.prerelease(utils.getIDEVersion())) {
        args.push('https://github.com/platformio/platformio/archive/develop.zip');
      } else {
        args.push('platformio');
      }
      utils.runCommand('pip', args, (code, stdout, stderr) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(`PIP: ${stderr}`);
        }
      });
    });
  }

  check() {
    return new Promise((resolve, reject) => {
      if (atom.config.get('platformio-ide.useBuiltinPIOCore') && !utils.isDir(config.ENV_BIN_DIR)) {
        return reject('Virtual environment is not created');
      }
      utils.getCoreVersion((version, err) => {
        if (err) {
          return reject(`PIO Core is not installed: ${err}`);
        }
        this.status = BaseStage.STATUS_SUCCESSED;
        console.debug(`Found PIO Core ${version}`);
        return resolve(true);
      });
    });
  }

  async install() {
    if (this.status === BaseStage.STATUS_SUCCESSED) {
      return true;
    }
    this.status = BaseStage.STATUS_INSTALLING;
    const pythonExecutable = await this.whereIsPython();
    if (!pythonExecutable) {
      this.status = BaseStage.STATUS_FAILED;
      throw new Error('Can not find Python Interpreter');
    }

    if (atom.config.get('platformio-ide.useBuiltinPIOCore')) {
      await this.createVirtualenv(pythonExecutable);
      await this.installPIOCore();
    }
    this.status = BaseStage.STATUS_SUCCESSED;
    return true;
  }

}
