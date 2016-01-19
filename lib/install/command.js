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
import tarball from 'tarball-extract';
import apd from 'atom-package-dependencies';
import rimraf from 'rimraf';
import {useBuiltinPlatformIO, getPythonExecutable, getPlatformIOExecutable, findFileByName, runAtomCommand} from '../utils';
import {InstallPlatformioView} from './view';
import {CACHE_DIR, ENV_DIR, ENV_BIN_DIR, PLATFORMIO_BASE_ARGS} from '../constants';

// Install PlatformIO
export function command() {
  if (useBuiltinPlatformIO()) {
    console.debug('About to install PlatformIO');
    const stateKey = 'platformio.installState';
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
          const check = child_process.spawn(getPythonExecutable(), ['--version']);
          check.on('close', (code) => {
            state.pythonWorks = 0 === code;
            if (!state.pythonWorks) {
              let title = 'PlaftormIO: Unable to run python.';
              let msg = 'Check PlatformIO package settings and make sure that ' +
                        'the Base Python option is set correctly.';
              atom.notifications.addError(title, {detail: msg});
              console.error(title);
              console.error(msg);
              resolve(state);
            }
            resolve(state);
          });
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
          state.view = new InstallPlatformioView();
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
                    'PlatformIO: Unable to find the virtualenv download URL');
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
                atom.notifications.addError(title, {detail: err});
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
                atom.notifications.addError(title, {detail: installProcess.stderr});
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
              atom.notifications.addError(title);
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
                atom.notifications.addError(title, {detail: makeEnvProcess.stderr});
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
                });
                console.error(installResultStderr);
                resolve(state);
              } else {
                apd.install(() => {
                  atom.notifications.addSuccess('PlatformIO has been successfully installed!');
                  atom.confirm({
                    message: 'PlatformIO has been successfully installed!',
                    detailedMessage: 'However, some of its components will only become ' +
                                     'available after Atom window reload. You may either ' +
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
        }
      },
    ];

    let chain = new Promise((resolve) => {
      // Retrieve the state object from localStorage
      let state;
      try {
        state = JSON.parse(localStorage.getItem(stateKey) || '{}');
      } catch(err) {
        console.error(err);
        state = {};
      }

      // Necessary for progress display
      state.step = 0;
      state.total = tasks.length;

      resolve(state);
    });

    // Chain tasks
    for (let i = 0; i < tasks.length; i++) {
      chain = chain.then((state) => {
        state.step += 1;
        if (state.view) {
          state.view.setProgress(Math.floor(state.step / state.total * 100));
        }

        if (state.canceled) {
          // Skip task, return the state right away
          return state;
        }

        return tasks[i](state);
      });
    }

    // Catch Cancel
    chain.then((state) => {
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
    chain.then((state) => {
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
    const pioVersionProcess = child_process.spawn(getPlatformIOExecutable(), PLATFORMIO_BASE_ARGS);
    pioVersionProcess.stderr.on('data', (chunk) => pioVersionProcessStderr += chunk);
    pioVersionProcess.on('close', (code) => {
      if (0 !== code) {
        let title = 'PlaftormIO is not available.';
        let msg = 'Can not find `platformio` command. Please install it' +
                  ' using `pip install platformio` or enable to use built-in PlatformIO in' +
                  ' `platformio-atom` package settings.\nDetails:\n' +
                  pioVersionProcessStderr;
        atom.notifications.addError(title, {detail: msg});
        console.error(title);
        console.error(pioVersionProcessStderr);
      }
    });
  }
}
