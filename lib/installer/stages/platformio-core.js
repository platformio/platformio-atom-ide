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

  static pythonVersion = '2.7.13';
  static vitrualenvUrl = 'https://pypi.python.org/packages/source/v/virtualenv/virtualenv-14.0.6.tar.gz';

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

      if (config.IS_WINDOWS) {
        try {
          return await this.installPythonForWindows();
        } catch (err) {
          console.error(err);
        }
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

  async installPythonForWindows() {
    // https://www.python.org/ftp/python/2.7.13/python-2.7.13.msi
    // https://www.python.org/ftp/python/2.7.13/python-2.7.13.amd64.msi
    const pythonArch = process.arch === 'x64' ? '.amd64' : '';
    const msiUrl = `https://www.python.org/ftp/python/${PlatformIOCoreStage.pythonVersion}/python-${PlatformIOCoreStage.pythonVersion}${pythonArch}.msi`;
    const msiInstaller = await download(msiUrl, path.join(getCacheDir(), path.basename(msiUrl)));
    const targetDir = path.join(config.PIO_HOME_DIR, 'python27');
    const logFile = path.join(getCacheDir(), 'python27msi.log');
    if (fs.isDirectorySync(targetDir)) {
      fs.removeSync(targetDir);
    }
    await new Promise((resolve, reject) => {
      utils.runCommand(
        'msiexec.exe',
        ['/i', msiInstaller, '/qn', '/li', logFile, `TARGETDIR=${targetDir}`],
        (code, stdout, stderr) => {
          if (code === 0) {
            return resolve(stdout);
          } else {
            if (fs.isFileSync(logFile)) {
              stderr = fs.readFileSync(logFile).toString();
            }
            return reject(`MSI Python2.7: ${stderr}`);
          }
        },
        {
          spawnOptions: {
            shell: true
          }
        }
      );
    });

    // append temporary to system environment
    process.env.PATH = [targetDir, path.join(targetDir, 'Scripts'), process.env.PATH].join(path.delimiter);
    process.env.Path = process.env.PATH;

    // install virtualenv
    return new Promise(resolve => {
      utils.runCommand(
        'pip',
        ['install', 'virtualenv'],
        () => resolve(path.join(targetDir, 'python.exe'))
      );
    });
  }

  chooseCustomPythonDirs() {
    return new Promise((resolve) => {
      atom.pickFolder(paths => {
        resolve(paths);
      });
    });
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

  isCondaInstalled() {
    return new Promise(resolve => {
      utils.runCommand('conda', ['--version'], code => resolve(code === 0));
    });
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
      download(
        PlatformIOCoreStage.vitrualenvUrl,
        path.join(getCacheDir(), 'virtualenv.tar.gz')
      ).then(archivePath => {
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

    if (await this.isCondaInstalled()) {
      await this.createVirtualenvWithConda();
    } else {
      const pythonExecutable = await this.whereIsPython();
      if (!pythonExecutable) {
        this.status = BaseStage.STATUS_FAILED;
        throw new Error('Can not find Python Interpreter');
      }
      try {
        await this.createVirtualenvWithUser(pythonExecutable);
      } catch (err) {
        console.error(err);
        await this.createVirtualenvWithDownload(pythonExecutable);
      }
    }

    await this.installPIOCore();

    this.status = BaseStage.STATUS_SUCCESSED;
    return true;
  }

}
