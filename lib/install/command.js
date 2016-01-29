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
import child_process from 'child_process';
import https from 'https';
import temp from 'temp';
import path from 'path';
import shell from 'shell';
import tarball from 'tarball-extract';
import apd from 'atom-package-dependencies';
import rimraf from 'rimraf';
import {useBuiltinPlatformIO, getPythonExecutable, findFileByName, runAtomCommand} from '../utils';
import {InstallPlatformIOView} from './view';
import {CACHE_DIR, ENV_DIR, ENV_BIN_DIR} from '../config';

// Install PlatformIO
export function command() {
  if (useBuiltinPlatformIO()) {
    const stateKey = 'platformio-ide:install-state';
    const updateProgress = (state) => {
      state.step += 1;
      if (state.view) {
        state.view.setProgress(Math.floor(state.step / state.total * 100));
      }
    };
    // Each task should take state as an argument and eventually return it
    // (directly or within a promise), so following task can use it).
    // Tasks will be executed in the order they are declared.
    const tasks = [
      (state) => {  // Check virtualenv existence
        return new Promise((resolve) => {
          fs.stat(ENV_BIN_DIR, (err) => {
            state.envDirExists = !err;
            resolve(state);
          });
        });
      },

      (state) => {  // Check cacne dir existence
        return new Promise((resolve) => {
          fs.stat(CACHE_DIR, (err) => {
            if (err) {
              fs.mkdir(CACHE_DIR, (err) => {
                if (err) {
                  throw new Error("Cannot create cache directory");
                }
                resolve(state);
              });
            }
            resolve(state);
          });
        });
      },

      (state) => {  // Ensure python is available
        return new Promise((resolve) => {
          state.pythonWorks = false;
          let msg = 'PlatformIO is written in Python and depends on it.' +
                    ' However, "python" command has not been found in ' +
                    'your system PATH. Please install Python 2.7 and ' +
                    'don\'t forget to "Add python.exe to Path" on the ' +
                    '"Customize" stage.';
          while (!state.pythonWorks && !state.canceled) {
            const check = child_process.spawnSync(getPythonExecutable(), ['--version']);
            state.pythonWorks = 0 === check.status;
            if (!state.pythonWorks) {
              atom.confirm({
                message: 'PlaftormIO: Unable to run python.',
                detailedMessage: msg,
                buttons: {
                  'Install Python': () => shell.openExternal('https://www.python.org/downloads/'),
                  'Try again': () => {},
                  'Abort PlatformIO IDE Installation': () => state.canceled = true,
                }
              });
            }
          }
          resolve(state);
        });
      },

      (state) => {  // Check if the virtualenv is cached
        return new Promise((resolve) => {
          const archivePath = path.join(CACHE_DIR, 'virtualenv.tar.gz');
          state.virtualenvArchivePath = archivePath;
          fs.stat(archivePath, (err) => {
            if (err && state.virtualenvArchiveExists) {
              delete state.virtualenvArchiveExists;
            }
            resolve(state);
          });
        });
      },

      (state) => {  // Initialize the view
        if (!state.envDirExists && state.pythonWorks) {
          state.view = new InstallPlatformIOView();
          state.view.handleCancel = () => state.canceled = true;
          state.panel = atom.workspace.addModalPanel({item: state.view.getElement()});
        }
        return state;
      },

      (state) => {  // Find the virtualenv download URL
        if (!state.envDirExists && state.view && !state.virtualenvArchiveExists && !state.virtualenvDownloadUrl) {
          return new Promise((resolve, reject) => {
            https.get('https://pypi.python.org/pypi/virtualenv/json', (res) => {
              var rawResponse = '';
              res.on('data', (chunk) => rawResponse += chunk);
              res.on('end', () => {
                const response = JSON.parse(rawResponse);
                response.urls.forEach((obj) => {
                  if ('source' === obj.python_version) {
                    state.virtualenvDownloadUrl = obj.url;
                    resolve(state);
                  }
                });
                if (!state.virtualenvDownloadUrl) {
                  atom.notifications.addError(
                    'PlatformIO: Unable to find the virtualenv download URL',
                    {dismissable: true});
                  reject(state);
                }
              });
            });
          });
        } else {
          return state;
        }
      },

      (state) => {  // Download the virtualenv source code archive
        if (!state.envDirExists && !state.virtualenvArchiveExists && state.virtualenvArchivePath) {
          return new Promise((resolve, reject) => {
            let file = fs.createWriteStream(state.virtualenvArchivePath);
            https.get(state.virtualenvDownloadUrl, (res) => {
              res.pipe(file);
            });
            file.on('error', () => reject(state));
            file.on('finish', () => {
              state.virtualenvArchiveExists = true;
              resolve(state);
            });
          });
        } else {
          return state;
        }
      },

      (state) => {  // Extract the virtualenv source code archive
        if (!state.envDirExists && state.virtualenvArchiveExists) {
          return new Promise((resolve, reject) => {
            const tmpDirPath = temp.mkdirSync({prefix: 'virtualenv-'});
            tarball.extractTarball(state.virtualenvArchivePath, tmpDirPath, (err) => {
              if (err) {
                let title = 'PlaftormIO: Failed to extract virtualenv.';
                atom.notifications.addError(title, {detail: err, dismissable: true});
                console.error(title);
                console.error('' + err);
                reject(state);
              }
              state.virtualenvExtractedInto = tmpDirPath;
              resolve(state);
            });
          });
        } else {
          return state;
        }
      },

      (state) => {  // Install the virtualenv into a temporary directory
        if (!state.envDirExists && state.virtualenvExtractedInto) {
          return new Promise((resolve, reject) => {
            state.virtualenvRoot = temp.mkdirSync({prefix: 'virtualenv-root'});
            const installArgs = ['setup.py', 'install', '--root', state.virtualenvRoot];
            const installOptions = {cwd: path.join(state.virtualenvExtractedInto, fs.readdirSync(state.virtualenvExtractedInto)[0])};
            const installProcess = child_process.spawn(getPythonExecutable(), installArgs, installOptions);
            installProcess.on('close', (code) => {
              state.virtualenvInstalled = 0 === code;
              if (!state.virtualenvInstalled) {
                let title = 'PlaftormIO: Unable to install the virtualenv.';
                atom.notifications.addError(
                  title, {detail: installProcess.stderr, dismissable: true});
                console.error(title);
                console.error('' + installProcess.stderr);
                reject(state);
              }
              resolve(state);
            });
          });
        } else {
          state.virtualenvInstalled = false;
          return state;
        }
      },

      (state) => {  // Make a virtualenv
        if (state.virtualenvInstalled) {
          return new Promise((resolve, reject) => {
            const virtualenvScript = findFileByName('virtualenv.py', state.virtualenvRoot);
            if (-1 === virtualenvScript) {
              let title = 'PlaftormIO: Cannot find the virtualenv.py script.';
              atom.notifications.addError(title, {dismissable: true});
              console.error(title);
              reject(state);
            }
            const makeEnvProcess = child_process.spawn(getPythonExecutable(), [virtualenvScript, ENV_DIR]);
            var makeEnvProcessStderr = '';
            makeEnvProcess.stderr.on('data', (chunk) => makeEnvProcessStderr += chunk);
            makeEnvProcess.on('close', (code) => {
              state.virtualenvCreated = 0 === code;
              if (!state.virtualenvCreated) {
                let title = 'PlaftormIO: Unable to create a virtualenv.';
                atom.notifications.addError(
                  title, {detail: makeEnvProcess.stderr, dismissable: true});
                console.error(title);
                console.error('' + makeEnvProcess.stderr);
              }
              resolve(state);
            });
          });
        } else {
          state.virtualenvCreated = false;
          return state;
        }
      },

      (state) => {  // Install the PlatformIO
        if (state.virtualenvCreated) {
          return new Promise((resolve) => {
            const args = ['install', 'platformio'];
            const executable = path.join(ENV_BIN_DIR, 'pip');
            const installResult = child_process.spawn(executable, args);
            var installResultStderr = '';
            installResult.stderr.on('data', (chunk) => installResultStderr += chunk);
            installResult.on('close', (code) => {
              state.platformioInstalled = 0 === code;
              if (!state.platformioInstalled) {
                atom.notifications.addError('Failed to install PlatformIO!', {
                  detail: installResultStderr,
                  dismissable: true,
                });
                console.error(installResultStderr);
                resolve(state);
              } else {
                if (state.restored) {
                  // Installing not for the first time
                  const apm = atom.packages.getApmPath();
                  for (let packageName of ['linter-clang', 'ult-terminal']) {
                    child_process.spawnSync(apm, ['uninstall', packageName]);
                  }
                }
                apd.install(() => {
                  updateProgress(state);
                  atom.config.set('tool-bar.position', 'Left');

                  atom.confirm({
                    message: 'PlatformIO IDE has been successfully installed!',
                    detailedMessage: 'However, some of its components will only become ' +
                                     'available after Atom window reload. You can ' +
                                     'click "Reload now" button below to perform reload ' +
                                     'immediately, or click "Reload later" and perform reload' +
                                     ' yourself with "View > Reload" command whenever ' +
                                     'you\'re ready.',
                    buttons: {
                      'Reload now': () => runAtomCommand('window:reload'),
                      'Reload later': () => {},
                    }
                  });
                  resolve(state);
                });
              }
            });
          });
        } else {
          return state;
        }
      },
    ];

    let chain = new Promise((resolve) => {
      // Retrieve the state object from localStorage
      let state;
      try {
        state = JSON.parse(localStorage.getItem(stateKey) || '{}');
        state.restored = true;
      } catch(err) {
        console.error(err);
        state = {};
      }

      // Necessary for progress display
      state.step = 0;
      state.total = tasks.length + 1;

      resolve(state);
    });

    // Chain tasks
    for (let i = 0; i < tasks.length; i++) {
      chain = chain.then((state) => {
        updateProgress(state);

        if (state.canceled) {
          // Skip task, return the state right away
          return state;
        }

        return tasks[i](state);
      });
    }

    // Catch Cancel
    chain = chain.then((state) => {
      if (state.canceled) {
        delete state.canceled;
        return new Promise((resolve) => {
          rimraf(ENV_DIR, () => resolve(state));
        });
      } else {
        return state;
      }
    });

    // Save the state
    chain = chain.then((state) => {
      if (state.panel) {
        state.panel.destroy();
        delete state.panel;
      }
      if (state.view) {
        delete state.view;
      }

      localStorage.setItem(stateKey, JSON.stringify(state));
    });

  } else {
    // Just check if platformio is available globally
    var pioVersionProcessStderr = '';
    const pioVersionProcess = child_process.spawn("platformio");
    pioVersionProcess.stderr.on('data', (chunk) => pioVersionProcessStderr += chunk);
    pioVersionProcess.on('close', (code) => {
      if (0 !== code) {
        let title = 'PlaftormIO tool is not available.';
        let msg = 'Can not find `platformio` command. Please install it' +
                  ' using `pip install platformio` or enable built-in PlatformIO tool in' +
                  ' `platformio-ide` package settings.\nDetails:\n' +
                  pioVersionProcessStderr;
        atom.notifications.addError(title, {detail: msg, dismissable: true});
        console.error(title);
        console.error(pioVersionProcessStderr);
      }
    });
  }
}

export function reinstallPlatformIO(useDevelop) {
  const executable = path.join(ENV_BIN_DIR, 'pip');

  // try to uninstall previous PlatformIO if exists
  child_process.spawnSync(executable, ['uninstall', '-y' ,'platformio']);

  const args = ['install'];
  if (useDevelop) {
      args.push('https://github.com/platformio/platformio/archive/develop.zip');
  }
  else {
    args.push('platformio');
  }

  const result = child_process.spawnSync(executable, args);
  if (0 !== result.status) {
    let title = 'PlaftormIO: Failed to install PlatformIO!';
    let msg = '' + result.stderr;
    atom.notifications.addError(title, {detail: msg, dismissable: true});
    console.error(title);
    console.error(msg);
    return;
  }
  return true;
}
