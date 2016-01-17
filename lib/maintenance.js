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
import os from 'os';
import path from 'path';
import temp from 'temp';
import https from 'https';
import tarball from 'tarball-extract';
import child_process from 'child_process';
import apd from 'atom-package-dependencies';
import {getUseBuiltinPlatformio, getPythonExecutable, findDirByName} from './utils';
import {ENV_DIR, ENV_BIN_DIR, WIN32, PLATFORMIO_BASE_ARGS, BASE_DIR} from './constants';

export function makeSurePlatformioInstalled() {
  if (getUseBuiltinPlatformio()) {
    if (!fs.statSyncNoException(ENV_DIR)) {  // env does not exist.
      // Make sure we can execute base python
      const basePythonExecutable = getPythonExecutable(true);
      const result = child_process.spawnSync(basePythonExecutable, ['--version']);
      if (0 !== result.status) {
        let title = 'PlaftormIO: Unable to run python.';
        let msg = 'Check PlatformIO package settings and make sure that ' +
                  'the Base Python option is set correctly.';
        atom.notifications.addError(title, {detail: msg});
        console.error(title);
        console.error(msg);
        return;
      }

      // Make virtualenv
      https.get('https://pypi.python.org/pypi/virtualenv/json', (res) => {
        var rawResponse = '';

        res.on('data', (chunk) => rawResponse += chunk);

        res.on('end', () => {
          const response = JSON.parse(rawResponse);
          var downloadUrl;
          response.urls.forEach((obj) => {
            if ('source' === obj.python_version) {
              downloadUrl = obj.url;
            }
          });

          const tmpFile = temp.openSync({prefix: 'virtualenv-', suffix: '.tar.gz'});
          const tmpDirPath = temp.mkdirSync({prefix: 'virtualenv-'});
          const tmpDirInstalledPath = temp.mkdirSync({prefix: 'virtualenv-installed'});
          tarball.extractTarballDownload(downloadUrl, tmpFile.path, tmpDirPath, {}, (err, result) => {
            if (err) {
              let title = 'PlaftormIO: Unable to download virtualenv.';
              atom.notifications.addError(title, {detail: err});
              console.error(title);
              console.error('' + err);
              return;
            }

            // Install the virtualenv
            const installArgs = ['setup.py', 'install', '--root', tmpDirInstalledPath];
            const installOptions = {cwd: path.join(tmpDirPath, fs.readdirSync(tmpDirPath)[0])};
            const installProcess = child_process.spawnSync(basePythonExecutable, installArgs, installOptions);
            if (0 !== installProcess.status) {
              let title = 'PlaftormIO: Unable to install the virtualenv.';
              atom.notifications.addError(title, {detail: installProcess.stderr});
              console.error(title);
              console.error('' + installProcess.stderr);
              return;
            }

            // Make a virtualenv
            const sitePackagesDir = findDirByName('site-packages', tmpDirInstalledPath);
            if (-1 === sitePackagesDir) {
              let title = 'PlaftormIO: Cannot find the site-packages directory.';
              atom.notifications.addError(title);
              console.error(title);
              return;
            }
            const virtualenvScript = path.join(sitePackagesDir, 'virtualenv.py');
            const makeEnvProcess = child_process.spawnSync(basePythonExecutable, [virtualenvScript, ENV_DIR]);
            if (0 !== makeEnvProcess.status) {
              let title = 'PlaftormIO: Unable to create a virtualenv.';
              atom.notifications.addError(title, {detail: makeEnvProcess.stderr});
              console.error(title);
              console.error('' + makeEnvProcess.stderr);
              return;
            }

            installPlatformio();
          });
        })
      });
    }
  } else {
    // Just check if platformio is available globally
    const pioVersionProcess = child_process.spawnSync(getPythonExecutable(), PLATFORMIO_BASE_ARGS);
    if (0 !== pioVersionProcess.status) {
      let title = 'PlaftormIO is not available.';
      let msg = 'Can not find `platformio` command. Please install it' +
                ' using `pip install platformio` or enable to use built-in PlatformIO in' +
                ' `platformio-atom` package settings.\nDetails:\n' +
                pioVersionProcess.stderr;
      atom.notifications.addError(title, {detail: msg});
      console.error(title);
      console.error('' + pioVersionProcess.stderr);
      return;
    }
  }
}

function installPlatformio() {
  const args = ['-m', 'pip', 'install', 'platformio'];
  const installResult = child_process.spawnSync(getPythonExecutable(), args);
  if (0 !== installResult.status) {
    atom.notifications.addError('Failed to install PlatformIO!', {
      detail: installResult.stderr,
    });
    console.error('' + installResult.stderr);
  } else {
    apd.install();
    atom.notifications.addSuccess('PlatformIO has been successfully installed!');
  }
}

export function installCommands() {
  if (WIN32) {
    const winCheckResult = child_process.spawnSync('platformio', ['--version']);
    if (0 !== winCheckResult.status) {
      const addResult = child_process.spawnSync(
        getPythonExecutable(),
        [path.join(BASE_DIR, 'misc', 'add_path_to_envpath.py'), ENV_BIN_DIR]);
      if (0 !== addResult.status) {
        atom.notifications.addError('Failed to install PlatformIO commands!', {
          detail: addResult.stderr,
        });
        console.error('' + addResult.stderr);
      } else {
        atom.notifications.addSuccess('PlatformIO commands successfully installed');
      }
    }
  } else {
    const checkResult = child_process.spawnSync('/bin/sh', ['command', '-v', 'platformio', '--version']);
    if (0 !== checkResult.status) {
      fs.symlinkSync(path.join(ENV_BIN_DIR, 'platformio'), '/usr/local/bin/platformio');
      // fs.symlinkSync(path.join(ENV_BIN_DIR, 'pio'), '/usr/local/bin/pio');
    }
  }
}
