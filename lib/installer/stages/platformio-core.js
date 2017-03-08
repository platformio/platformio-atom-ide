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

import { download, extractTarGz, getCacheDir, getPythonExecutable } from '../util';
import BaseStage from './base';
import fs from 'fs-plus';
import path from 'path';
import semver from 'semver';
import tmp from 'tmp';

export default class PlatformIOCoreStage extends BaseStage {

  static VIRTUALENV_UNKNOWN_TYPE = 0;
  static VIRTUALENV_USER_TYPE = 1;
  static VIRTUALENV_CONDA_TYPE = 2;

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

  async getVirtualenvType() {
    let found = false;
    // conda
    found = await new Promise(resolve => {
      utils.runCommand('conda', ['--version'], code => resolve(code === 0));
    });
    if (found) {
      return PlatformIOCoreStage.VIRTUALENV_CONDA_TYPE;
    }
    // user's
    found = await new Promise(resolve => {
      utils.runCommand('virtualenv', ['--version'], code => resolve(code === 0));
    });
    if (found) {
      return PlatformIOCoreStage.VIRTUALENV_USER_TYPE;
    }
    return PlatformIOCoreStage.VIRTUALENV_UNKNOWN_TYPE;
  }

  cleanVirtualEnvDir() {
    if (fs.isDirectorySync(config.ENV_DIR)) {
      try {
        fs.removeSync(config.ENV_DIR);
      } catch (err) {
        console.error(err);
      }
    }
  }

  createVirtualenvWithConda() {
    return new Promise((resolve, reject) => {
      this.cleanVirtualEnvDir();
      utils.runCommand(
        'conda',
        ['create', '--yes', '--quiet', 'python=2', '--prefix', config.ENV_DIR],
        (code, stdout, stderr) => {
          if (code === 0) {
            return resolve(stdout);
          } else {
            return reject(`Conda Virtualenv: ${stderr}`);
          }
        }
      );
    });
  }

  createVirtualenvWithUser(pythonExecutable) {
    return new Promise((resolve, reject) => {
      this.cleanVirtualEnvDir();
      utils.runCommand(
        'virtualenv',
        ['-p', pythonExecutable, config.ENV_DIR],
        (code, stdout, stderr) => {
          if (code === 0) {
            return resolve(stdout);
          } else {
            return reject(`User's Virtualenv: ${stderr}`);
          }
        }
      );
    });
  }

  createVirtualenvWithDownload(pythonExecutable) {
    return new Promise((resolve, reject) => {
      this.cleanVirtualEnvDir();
      this.downloadVirtualenv().then(archivePath => {
        const tmpDir = tmp.dirSync({
          unsafeCleanup: true
        });
        extractTarGz(archivePath, tmpDir.name).then(dstDir => {
          const virtualenvScript = fs.listTreeSync(dstDir).find(
            item => path.basename(item) === 'virtualenv.py');
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
                return reject(`Virtualenv Download: ${stderr}`);
              }
            }
          );
        });
      }).catch(err => reject(`Virtualenv Download: ${err}`));
    });
  }

  installPIOCore() {
    return new Promise((resolve, reject) => {
      let cmd = 'pip';
      const args = ['install', '--no-cache-dir', '-U'];
      if (atom.config.get('platformio-ide.useDevelopmentPIOCore') || semver.prerelease(utils.getIDEVersion())) {
        cmd = path.join(config.ENV_BIN_DIR, 'pip');
        args.push('https://github.com/platformio/platformio/archive/develop.zip');
      } else {
        args.push('platformio');
      }
      utils.runCommand(cmd, args, (code, stdout, stderr) => {
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
      if (atom.config.get('platformio-ide.useBuiltinPIOCore') && !fs.isDirectorySync(config.ENV_BIN_DIR)) {
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
    if (!atom.config.get('platformio-ide.useBuiltinPIOCore')) {
      this.status = BaseStage.STATUS_SUCCESSED;
      return true;
    }
    this.status = BaseStage.STATUS_INSTALLING;

    let venvType = await this.getVirtualenvType();
    venvType = PlatformIOCoreStage.VIRTUALENV_UNKNOWN_TYPE;
    if (venvType === PlatformIOCoreStage.VIRTUALENV_CONDA_TYPE) {
      await this.createVirtualenvWithConda();
    } else {
      const pythonExecutable = await this.whereIsPython();
      if (!pythonExecutable) {
        this.status = BaseStage.STATUS_FAILED;
        throw new Error('Can not find Python Interpreter');
      }
      if (venvType === PlatformIOCoreStage.VIRTUALENV_USER_TYPE) {
        try {
          await this.createVirtualenvWithUser(pythonExecutable);
        } catch (err) {
          console.error(err);
          await this.createVirtualenvWithDownload(pythonExecutable);
        }
      } else {
        await this.createVirtualenvWithDownload(pythonExecutable);
      }
    }

    await this.installPIOCore();

    this.status = BaseStage.STATUS_SUCCESSED;
    return true;
  }

}
