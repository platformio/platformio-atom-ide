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
import rimraf from 'rimraf';
import semver from 'semver';
import {useBuiltinPlatformIO, getPythonExecutable, findFileByName, runAtomCommand} from '../utils';
import {InstallPlatformIOView} from './view';
import {CACHE_DIR, DEPENDENCIES, ENV_DIR, ENV_BIN_DIR, STALE_DEPENDENCIES} from '../config';

const STATE_KEY = 'platformio-ide:install-state';
const PROGRESS_STEPS = 13;

// Install PlatformIO
export function command() {
  const chain = Promise.resolve()
    .then(initializeState)
    .then(ensureThatCacheDirectoryExists)
    .then(checkIfVirtualenvShouldBeCreated)
    .then(checkIfPackageManagmentIsNecessary)
    .then(initializeView)
    .then(wrap(ensurePythonIsAvailable))

    .then(wrap(checkIfVirtualenvArchiveIsCached))
    .then(wrap(fetchVirtualenvArchiveUrl))
    .then(wrap(downloadVirtualenvArchive))
    .then(wrap(extractVirtualenvArchive))
    .then(wrap(installVirtualenvIntoTemporaryDirectory))
    .then(wrap(makePenv))
    .then(wrap(installPlatformIO))

    .then(wrap(uninstallStaleDependencies))
    .then(wrap(installNewDependencies))
    .then(wrap(upgradeOutdatedDependencies))
    .then(wrap(activateInactiveDependencies))
    .then(wrap(adjustToolbarPosition))

    .then(notifyUser)

    .then(cleanupIfCanceled)
    .then(destroyViewAndSaveState);

  return chain;
}

export function reinstallPlatformIO(useDevelop) {
  const executable = path.join(ENV_BIN_DIR, 'pip');
  const notifocation = atom.notifications.addInfo('PlaformIO reinstalling initiated.',{
    dismissable: true,
    detail: 'Please wait.',
  });
  return Promise.resolve()
    .then(() => {
      return new Promise((resolve) => {
        // try to uninstall previous PlatformIO if exists
        const child = child_process.spawn(executable, ['uninstall', '-y' ,'platformio']);
        child.on('close', () => resolve());
      });
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        let args = ['install'];
        if (useDevelop) {
          args.push('https://github.com/platformio/platformio/archive/develop.zip');
        } else {
          args.push('platformio');
        }

        let stderr = '';
        const child = child_process.spawn(executable, args);
        child.stderr.on('data', chunk => stderr += chunk);
        child.on('close', (code) => {
          if (0 !== code) {
            let title = 'PlaftormIO: Failed to install PlatformIO!';
            atom.notifications.addError(title, {detail: stderr, dismissable: true});
            console.error(title);
            console.error(stderr);
            reject();
          }
          resolve();
        });
      });
    })
    .then(() => notifocation.dismiss())
    .catch((err) => {
      notifocation.dismiss();
      throw err;
    });
}


// Tasks below are installation steps. Each task must accept a state as an
// argument and eventually return a modified state (directly or via promise).

function initializeState() {
  return new Promise((resolve) => {
    // Retrieve the state object from localStorage
    let state;
    try {
      state = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
      state.restored = true;
    } catch(err) {
      console.error(err);
      state = {};
    }

    // Necessary for progress display
    state.step = 0;
    state.total = PROGRESS_STEPS;

    resolve(state);
  });
}

function ensureThatCacheDirectoryExists(state) {
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
}

function checkIfVirtualenvShouldBeCreated(state) {
  return new Promise((resolve) => {
    fs.stat(ENV_BIN_DIR, (err) => {
      state.envShouldBeCreated = useBuiltinPlatformIO() && !err;
      resolve(state);
    });
  });
}

function checkIfPackageManagmentIsNecessary(state) {
  const availablePackages = atom.packages.getAvailablePackageNames();

  state.packagesToRemove = STALE_DEPENDENCIES
    .filter((name) => availablePackages.indexOf(name) > 0);
  state.packagesToInstall = Object.keys(DEPENDENCIES)
    .filter((name) => availablePackages.indexOf(name) === -1);
  state.packagesToUpgrade = Object.keys(DEPENDENCIES)
    .filter((name) => {
      const installedVersion = atom.packages.getLoadedPackage(name).metadata.version;
      const requiredVersion = DEPENDENCIES[name];
      return !semver.satisfies(installedVersion, requiredVersion);
    });

  state.packageManagementIsNecessary = Boolean(
    state.packagesToRemove.length ||
    state.packagesToInstall.length ||
    state.packagesToUpgrade.length
  );
  return state;
}

function initializeView(state) {
  if (viewShoulBeDisplayed(state)) {
    state.view = new InstallPlatformIOView();
    state.view.handleCancel = () => state.canceled = true;
    state.panel = atom.workspace.addModalPanel({item: state.view.getElement()});
  }
  return state;
}

function ensurePythonIsAvailable(state) {
  return new Promise((resolve) => {
    state.pythonWorks = false;
    const msg = 'PlatformIO is written in Python and depends on it.' +
                ' However, "python" command has not been found in ' +
                'your system PATH. Please install Python 2.7 and ' +
                'don\'t forget to "Add python.exe to Path" on the ' +
                '"Customize" stage.';
    const confirmOptions = {
      message: 'PlaftormIO: Unable to run python.',
      detailedMessage: msg,
      buttons: {
        'Install Python': goToPythonDownloadsPage,
        'Try again': doNothing,
        'Abort PlatformIO IDE Installation': cancel,
      }
    };
    while (!state.pythonWorks && !state.canceled) {
      const check = child_process.spawnSync(getPythonExecutable(), ['--version']);
      state.pythonWorks = 0 === check.status;
      if (!state.pythonWorks) {
        atom.confirm(confirmOptions);
      }
    }
    resolve(state);
  });

  function goToPythonDownloadsPage() {
    return shell.openExternal('https://www.python.org/downloads/');
  }

  function doNothing() {}

  function cancel() {
    state.canceled = true;
  }
}

function checkIfVirtualenvArchiveIsCached(state) {
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
}

function fetchVirtualenvArchiveUrl(state) {
  if (!state.envShouldBeCreated && state.view && !state.virtualenvArchiveExists && !state.virtualenvDownloadUrl) {
    // Temporary use 14.0.1
    // Details: https://github.com/platformio/platformio/issues/488
    state.virtualenvDownloadUrl = 'https://pypi.python.org/packages/source/v/virtualenv/virtualenv-14.0.1.tar.gz';
    return state;
  } else {
    return state;
  }
}

function downloadVirtualenvArchive(state) {
  if (!state.envShouldBeCreated && !state.virtualenvArchiveExists && state.virtualenvArchivePath) {
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
}

function extractVirtualenvArchive(state) {
  if (!state.envShouldBeCreated && state.virtualenvArchiveExists) {
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
}

function installVirtualenvIntoTemporaryDirectory (state) {
  if (!state.envShouldBeCreated && state.virtualenvExtractedInto) {
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
}

function makePenv(state) {
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
}

function installPlatformIO(state) {
  delete state.platformioInstalled;
  if (state.virtualenvCreated) {
    return new Promise((resolve) => {
      const executable = path.join(ENV_BIN_DIR, 'pip');
      const args = ['install', '-U', 'platformio'];
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
        }
        resolve(state);
      });
    });
  } else {
    return state;
  }
}

function uninstallStaleDependencies(state) {
  if (state.packagesToRemove.length) {
    return apm('uninstall', state.packagesToRemove).then(() => state);
  } else {
    return state;
  }
}

function installNewDependencies(state) {
  if (state.packagesToInstall.length) {
    return apm('install', state.packagesToInstall).then(() => state);
  } else {
    return state;
  }
}

function upgradeOutdatedDependencies(state) {
  if (state.packagesToUpgrade.length) {
    return apm('upgrade', state.packagesToUpgrade, '--no-confirm').then(() => state);
  } else {
    return state;
  }
}

function activateInactiveDependencies(state) {
  const packagesToEnable = Object.keys(DEPENDENCIES)
    .filter((name) => !atom.packages.isPackageActive(name));

  let p = Promise.resolve();
  for (let i = 0; i < packagesToEnable.length; i++) {
    p = p.then(() => atom.packages.activatePackage(packagesToEnable[i]));
  }
  return p.then(() => state);
}

function notifyUser(state) {
  if (!state.canceled && viewShoulBeDisplayed(state)) {
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
  }
  return state;
}

function adjustToolbarPosition(state) {
  if (!state.restored) {
    atom.config.set('tool-bar.position', 'Left');
  }
  return state;
}

function cleanupIfCanceled(state) {
  if (state.canceled) {
    delete state.canceled;
    return new Promise((resolve) => {
      rimraf(ENV_DIR, () => resolve(state));
    });
  } else {
    return state;
  }
}

function destroyViewAndSaveState(state) {
  if (state.panel) {
    state.panel.destroy();
    delete state.panel;
  }
  if (state.view) {
    delete state.view;
  }

  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function apm(action, packages, ...additionalArgs) {
  return new Promise((resolve, reject) => {
    const executable = atom.packages.getApmPath();
    const args = [action].concat(packages).concat(additionalArgs);
    const child = child_process.spawn(executable, args);
    child.on('close', (code) => {
      if (0 !== code) {
        atom.notifications.addError(
          `PlatformIO: Failed to ${action} the following packages: ${packages}.`,
          {dismissable: true});
          reject();
      }
      resolve();
    });
  });
}

function wrap(task) {
  return function(state) {
    state.step += 1;
    if (state.view) {
      state.view.setProgress(Math.floor(state.step / state.total * 100));
    }
    if (state.canceled) {
      // Skip task, return the state right away
      return state;
    }
    return task(state);
  };
}

function viewShoulBeDisplayed(state) {
  return !state.envShouldBeCreated || state.packageManagementIsNecessary;
}
