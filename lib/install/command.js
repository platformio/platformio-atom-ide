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

import * as config from '../config';
import * as utils from '../utils';
import {InstallPlatformIOView} from './view';
import child_process from 'child_process';
import fs from 'fs-extra';
import lockfile from 'lockfile';
import path from 'path';
import request from 'request';
import semver from 'semver';
import shell from 'shell';
import temp from 'temp';

const STATE_KEY = 'platformio-ide:install-state';
const PROGRESS_STEPS = 9;
const LOCKFILE_PATH = path.join(config.BASE_DIR, 'install.lock');
const LOCKFILE_TIMEOUT = 5 * 60 * 1000;

// Install PlatformIO
export function command() {
  // cleanup dead lock file
  var stats = fs.statSyncNoException(LOCKFILE_PATH);
  if (stats) {
    if ((new Date().getTime() - new Date(stats.mtime).getTime()) > LOCKFILE_TIMEOUT) {
      fs.unlinkSync(LOCKFILE_PATH);
    }
  }

  const chain = Promise.resolve()
    .then(initializeState)
    .then(ensureThatCacheDirectoryExists)
    .then(checkIfVirtualenvShouldBeCreated)
    .then(checkIfPackageManagmentIsNecessary)
    .then(checkIfExamplesHaveToBeDownloaded)
    .then(function (state) {
      if (!timeConsumingOperationsRequired(state)) {
        return activateInactiveDependencies()
          .catch((err) => {
            atom.notifications.addError('An error occured during a PlatformIO dependencies installation.', {
              detail: err.toString(),
              dismissable: true,
            });
          });
      }
      return new Promise((resolve) => {
        lockfile.lock(LOCKFILE_PATH, (err) => {
          if (err) {
            atom.notifications.addInfo('PlatformIO IDE installation suspended.', {
              detail: 'Seems like PlatformIO IDE is already being installed in ' +
                      'another window.',
              dismissable: true,
            });
            resolve();
          } else {
            const promise = performInstall(state)
              .then(releaseLock, releaseLock);
            resolve(promise);
          }

          function releaseLock() {
            return lockfile.unlock(LOCKFILE_PATH, (err) => {
              if (err) {
                console.warn('Failed to release the lock: ' + err.toString());
              }
            });
          }
        });
      });
    });
  return chain;
}

function performInstall(state) {
  let panel;
  const chain = Promise.resolve(state)
    .then(function initializeView(state) {
      if (timeConsumingOperationsRequired(state)) {
        // Make view and panel accessible from outside of the tasks, so they can
        // be destroyed correctly even when error happens during some step.
        state.view = new InstallPlatformIOView();
        state.view.handleCancel = () => state.canceled = true;
        state.panel = panel = atom.workspace.addModalPanel({item: state.view.getElement()});
      }
      return state;
    })
    .then(wrap(ensurePythonIsAvailable))

    .then(wrap(installPlatformIO))

    .then(wrap(installDependenciesFirstTime))
    .then(wrap(uninstallStaleDependencies))
    .then(wrap(installNewDependencies))
    .then(wrap(upgradeOutdatedDependencies))
    .then(wrap(activateInactiveDependencies))
    .then(wrap(adjustToolbarPosition))

    .then(wrap(getExamples))

    .then(notifyUser)

    .catch((err) => {
      return cleanup()
        .then(() => console.error(err));
    })

    .then(cleanupIfCanceled)
    .then(function destroyViewAndSaveState(state) {
      if (panel) {
        panel.destroy();
      }
      if (state && state.panel) {
        delete state.panel;
      }
      if (state && state.view) {
        delete state.view;
      }

      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    })
    .then(checkIfPlatformIOCanBeExecuted);

  return chain;
}

export function reinstallPlatformIO(useDevelop) {
  const executable = path.join(config.ENV_BIN_DIR, 'pip');
  const notifocation = atom.notifications.addInfo('PlatformIO: Reinstalling initiated.',{
    dismissable: true,
    detail: 'Please wait.',
  });
  return Promise.resolve()
    .then(() => {
      return new Promise((resolve, reject) => {
        // try to uninstall previous PlatformIO if exists
        const child = child_process.spawn(executable, ['uninstall', '-y' ,'platformio']);
        child.on('error', e => reject(e));
        child.on('close', () => resolve());
      });
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        const args = ['install'];
        if (useDevelop) {
          args.push('https://github.com/platformio/platformio/archive/develop.zip');
        } else {
          args.push('platformio');
        }

        let stderr = '';
        const child = child_process.spawn(executable, args);
        child.on('error', onError);
        child.stderr.on('data', chunk => stderr += chunk);
        child.on('close', (code) => {
          if (0 !== code) {
            onError(stderr);
            return;
          }
          resolve();
        });

        function onError(err) {
          const title = 'PlatformIO: Failed to install PlatformIO!';
          atom.notifications.addError(title, {detail: err, dismissable: true});
          console.error(title);
          console.error(err);
          reject();
        }
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
      state = JSON.parse(localStorage.getItem(STATE_KEY));
      if (state instanceof Object) {
        state.restored = true;
      } else {
        state = {};
      }
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
    fs.stat(config.CACHE_DIR, (err) => {
      if (err) {
        fs.mkdir(config.CACHE_DIR, (err) => {
          if (err) {
            throw new Error('Cannot create cache directory');
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
    fs.stat(config.ENV_BIN_DIR, (err) => {
      state.envShouldBeCreated = utils.useBuiltinPlatformIO() && err;
      resolve(state);
    });
  });
}

function checkIfPackageManagmentIsNecessary(state) {
  const availablePackages = atom.packages.getAvailablePackageNames();

  state.packagesToRemove = config.STALE_DEPENDENCIES
    .filter((name) => availablePackages.indexOf(name) > 0);
  state.packagesToInstall = Object.keys(config.DEPENDENCIES)
    .filter((name) => availablePackages.indexOf(name) === -1);
  state.packagesToUpgrade = Object.keys(config.DEPENDENCIES)
    .filter((name) => {
      const packagePath = utils.resolveAtomPackagePath(name);
      if (!packagePath) {
        // Package is not even installed.
        return false;
      }

      const metadata = atom.packages.loadPackageMetadata(packagePath);
      if (!metadata) {
        return false;
      }

      const installedVersion = metadata.version;
      const requiredVersion = config.DEPENDENCIES[name];
      return !semver.satisfies(installedVersion, requiredVersion);
    });

  state.packageManagementIsNecessary = Boolean(
    state.packagesToRemove.length ||
    state.packagesToInstall.length ||
    state.packagesToUpgrade.length
  );
  return state;
}

function checkIfExamplesHaveToBeDownloaded(state) {
  return new Promise((resolve) => {
    archive_path = path.join(config.CACHE_DIR, 'examples.tar.gz');
    fs.stat(archive_path, (err) => {
      state.examplesHaveToBeDownloaded = err? true : false;
      if (!state.examplesHaveToBeDownloaded) {
        state.examplesHaveToBeDownloaded = fs.statSync(archive_path)["size"] == 0;
      }
      resolve(state);
    });
  });
}

function getExamples(state) {
  const url = 'https://github.com/platformio/platformio-examples/tarball/master';
  const folder = path.join(config.BASE_DIR, 'project-examples');
  return new Promise(resolve => {
    fs.stat(folder, (err, stat) => {
      if (stat && stat.isDirectory()) {
        fs.remove(folder);
      }
      resolve();
    });
  }).then(() => getCachedArchive(url, 'examples.tar.gz'))
    .then((archivePath) => new Promise((resolve, reject) => {
      fs.readdir(archivePath, (err, files) => {
        if (files.length !== 1) {
          reject('Examples archive must contain single directory');
          return;
        }
        try {
          fs.copySync(path.join(archivePath, files[0]), folder);
          resolve();
        } catch(e) {
          reject(e);
        }
      });
    }))
    .then(() => state);
}

function ensurePythonIsAvailable(state) {
  return new Promise((resolve) => {
    state.pythonWorks = false;
    let msg = 'PlatformIO is written in Python and depends on it.' +
                ' However, "python" command has not been found in ' +
                'your system PATH. Please install Python 2.7 (PYTHON 3 IS NOT SUPPORTED YET)';
    if (config.IS_WINDOWS) {
      msg += ' and don\'t forget to "Add python.exe to Path" on the "Customize" stage.';
    }

    const confirmOptions = {
      message: 'PlatformIO: Unable to run python.',
      detailedMessage: msg,
      buttons: {
        'Install Python 2.7': goToPythonDownloadsPage,
        'Try again': doNothing,
        'Abort PlatformIO IDE Installation': cancel,
      }
    };
    while (!state.pythonWorks && !state.canceled) {
      try {
        utils.getPythonExecutable();
        state.pythonWorks = true;
      } catch(e) {
        state.pythonWorks = false;
      }
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

function extractArchiveIntoTemporaryDirectory(archivePath) {
  const tmpDirPath = temp.mkdirSync();
  return utils.extractTargz(archivePath, tmpDirPath)
    .then(function() {
      return tmpDirPath;
    });
}

function getCachedArchive(downloadUrl, fileName) {
  return checkIfFileIsCached(fileName)
    .catch((archivePath) => { // skipped unless archive is not cached
      return download(downloadUrl, archivePath);
    })
    .then(extractArchiveIntoTemporaryDirectory);
}

function checkIfFileIsCached(name) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(config.CACHE_DIR, name);
    fs.stat(fullPath, (err) => {
      if (err || fs.statSync(fullPath)["size"] == 0) {
        reject(fullPath);
      }
      resolve(fullPath);
    });
  });
}

function download(source, target) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(target);
    const options = {url: source};

    const child = child_process.spawnSync(atom.packages.getApmPath(), ['config', 'get', 'https-proxy']);
    const proxy = child.stdout.toString().trim();
    if (0 === child.status && 'null' !== proxy) {
      options.proxy = proxy;
    }

    request.get(options)
      .on('error', (err) => reject(err))
      .pipe(file);
    file.on('error', (err) => reject(err));
    file.on('finish', () => resolve(target));
  });
}

function makePenv(virtualenvSrc) {
  return new Promise((resolve, reject) => {
    const virtualenvScript = utils.findFileByName('virtualenv.py', virtualenvSrc);
    if (-1 === virtualenvScript) {
      const title = 'PlatformIO: Cannot find the virtualenv.py script.';
      atom.notifications.addError(title, {dismissable: true});
      console.error(title);
      reject();
    }
    const args = [virtualenvScript, config.ENV_DIR];
    const makeEnvProcess = child_process.spawn(utils.getPythonExecutable(), args);
    makeEnvProcess.on('error', onError);
    var makeEnvProcessStderr = '';
    makeEnvProcess.stderr.on('data', (chunk) => makeEnvProcessStderr += chunk);
    makeEnvProcess.on('close', (code) => {
      if (0 !== code) {
        onError(makeEnvProcessStderr);
        return;
      }
      resolve();
    });

    function onError(err) {
      const title = 'PlatformIO: Unable to create a virtualenv.';
      atom.notifications.addError(title, {detail: err, dismissable: true});
      console.error(title);
      console.error('' + err);
      reject();
    }
  });
}

function installPlatformIO(state) {
  if (!state.envShouldBeCreated) {
    return state;
  }

  const vitrualenvUrl = 'https://pypi.python.org/packages/source/v/' +
                        'virtualenv/virtualenv-14.0.6.tar.gz';
  return getCachedArchive(vitrualenvUrl, 'virtualenv.tar.gz')
    .then(makePenv)
    .then(() => {
      return new Promise((resolve) => {
        const executable = path.join(config.ENV_BIN_DIR, 'pip');
        const args = ['install', '-U', 'platformio'];
        const child = child_process.spawn(executable, args);
        let stderr = '';
        child.stderr.on('data', (chunk) => stderr += chunk);
        child.on('close', (code) => {
          state.platformioInstalled = 0 === code;
          if (!state.platformioInstalled) {
            atom.notifications.addError('Failed to install PlatformIO!', {
              detail: stderr,
              dismissable: true,
            });
            console.error(stderr);
          }
          resolve(state);
        });
      });
    });
}

function installDependenciesFirstTime(state) {
  if (state.restored) {
    return state;
  }

  const depsUrl = 'http://dl.platformio.org/ide-bundles/platformio-atom-ide-deps.tar.gz';
  return getCachedArchive(depsUrl, 'deps.tar.gz')
    .then((extractedPackagesDir) => {
      const packagesCopied = [];
      const packagesDir = atom.packages.getPackageDirPaths()[0];
      for (const packageName of state.packagesToInstall) {
        const source = path.join(extractedPackagesDir, packageName);
        const sourceStat = fs.statSyncNoException(source);
        const target = path.join(packagesDir, packageName);
        const targetStat = fs.statSyncNoException(target);
        if (sourceStat && sourceStat.isDirectory() && !targetStat) {
          fs.copySync(source, target);
          packagesCopied.push(packageName);
        }
      }
      state.packagesToInstall = state.packagesToInstall
        .filter((name) => packagesCopied.indexOf(name) === -1);
    })
    .catch((reason) => {
      console.warn('Failed to install dependencies from archive.');
      console.warn(reason);
    })
    .then(() => state);
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
  const packagesToEnable = Object.keys(config.DEPENDENCIES)
    .filter((name) => !atom.packages.isPackageActive(name));

  let p = Promise.resolve();
  for (const packageName of packagesToEnable) {
    p = p.then(activatePackage(packageName));
  }
  return p.then(() => state);

  function activatePackage(packageName) {
    return function() {
      return atom.packages.activatePackage(packageName);
    };
  }
}

function notifyUser(state) {
  if (!state.canceled && timeConsumingOperationsRequired(state)) {
    atom.confirm({
      message: 'PlatformIO IDE has been successfully installed!',
      detailedMessage: 'However, some of its components will be ' +
                       'available after Atom window reload. You can ' +
                       'click "Reload now" button below to perform reload ' +
                       'immediately or click "Reload later" and perform reload' +
                       ' yourself with "View > Developer > Reload Window" command whenever ' +
                       'you\'re ready.',
      buttons: {
        'Reload now': () => utils.runAtomCommand('window:reload'),
        'Reload later': () => {},
      }
    });
  }
  return state;
}

function adjustToolbarPosition(state) {
  const key = 'platformio-ide.defaultToolbarPositionHasBeenSet';
  if (!localStorage.getItem(key) && atom.packages.getActivePackage('tool-bar')) {
    atom.config.set('tool-bar.position', 'Left');
    localStorage.setItem(key, 'true');
  }
  return state;
}

function cleanupIfCanceled(state) {
  if (state && state.canceled) {
    delete state.canceled;
    return cleanup(state);
  } else {
    return state;
  }
}

function cleanup() {
  return new Promise((resolve) => {
    fs.remove(config.ENV_DIR, () => resolve(...arguments));
  });
}

function apm(action, packages, ...additionalArgs) {
  return new Promise((resolve, reject) => {
    const executable = atom.packages.getApmPath();
    const args = [action].concat(packages).concat(additionalArgs);
    const child = child_process.spawn(executable, args);
    let stderr = '';
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('error', (err) => {
      atom.notifications.addError(err, {dismissable: true});
    });
    child.on('close', (code) => {
      if (0 !== code) {
        const msg = `PlatformIO: Failed to ${action} the following ` +
                    `packages: ${packages.join(', ')}.`;
        atom.notifications.addError(msg, {
          detail: stderr,
          dismissable: true,
        });
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

function timeConsumingOperationsRequired(state) {
  return !state.restored || state.envShouldBeCreated || state.packageManagementIsNecessary || state.examplesHaveToBeDownloaded;
}

function checkIfPlatformIOCanBeExecuted() {
  return new Promise((resolve, reject) => {
    var pioVersionProcessStderr = '';
    const pioVersionProcess = child_process.spawn('platformio');
    pioVersionProcess.on('error', onError);
    pioVersionProcess.stderr.on('data', (chunk) => pioVersionProcessStderr += chunk);
    pioVersionProcess.on('close', (code) => {
      if (0 !== code) {
        onError(pioVersionProcessStderr);
        return;
      }
      resolve();
    });

    function onError(err) {
      const title = 'PlatformIO tool is not available.';
      const msg = 'Can not find `platformio` command. Please install it' +
                  ' using `pip install platformio` or enable built-in PlatformIO tool in' +
                  ' `Menu: PlatformIO > Settings > platformio-ide` package.\nDetails:\n' +
                  pioVersionProcessStderr;
      atom.notifications.addError(title, {detail: msg, dismissable: true});
      console.error(title);
      console.error(err);
      reject();
    }
  });
}
