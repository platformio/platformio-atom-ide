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

import {ImportArduinoProjectView} from './view';
import {Transform} from 'stream';
import fs from 'fs-extra';
import {handleLibChanges} from '../maintenance';
import ini from 'ini';
import path from 'path';
import {runAtomCommand} from '../utils';
import temp from 'temp';
import {initializeProject, installPlatformsForBoards} from '../init/command';

export function command() {
  // Initialize view
  var view = new ImportArduinoProjectView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  // Set buttons handlers
  view.handleCancel = () => panel.destroy();
  view.handleImport = () => {
    const projectPath = view.getDirectory();
    const keepCompatible = view.getKeepCompatible();
    const useArduinoLibManager = view.getUseArduinoLibManager();

    let originalProjectFiles = [];

    let chain = Promise.resolve();
    if (keepCompatible) {
      chain = chain.then(copyWholeProject);
    } else {
      chain = chain.then(recordOriginalFilesNames);
      chain = chain.then(moveOriginalFilesToSrcDirectory);
    }

    chain = chain.then(() => {
      return installPlatformsForBoards(view.getSelectedBoards(), view);
    });

    chain = chain.then(() => view.setStatus('Performing initialization...'));
    chain = chain.then(() => initializeProject(view.getSelectedBoards(), projectPath));

    chain = chain.then(modifyPlatformioIni);
    chain = chain.then(addIncludeToInoFiles);

    chain = chain.then(() => atom.project.addPath(projectPath));
    chain = chain.then(() => handleLibChanges([projectPath]));

    chain = chain.then(() => {
      let notifyMessage = 'The next files/directories were created in "' + projectPath + '"\n' +
        '"platformio.ini" - Project Configuration File\n' +
        '"lib" - Put here project specific (private) libraries';
      if (!keepCompatible) {
        notifyMessage += '\n"src" - Put your source code here';
      }
      atom.notifications.addSuccess('PlatformIO: Project has been successfully imported!', {
        detail: notifyMessage
      });
      runAtomCommand('build:refresh-targets');
      if (keepCompatible) {
        fs.remove(path.join(projectPath, 'src'));
      }
    }).catch((reason) => {
      const title = 'PlatformIO: Failed to import an Arduino IDE project!';
      atom.notifications.addError(title, {detail: reason, dismissable: true});
      console.error(title);
      console.error(reason);
    }).then(() => panel.destroy());
    return chain;

    function recordOriginalFilesNames() {
      return new Promise((resolve, reject) => {
        fs.readdir(projectPath, (err, files) => {
          if (err) {
            reject(err);
          } else {
            originalProjectFiles = files.filter(skipVCS);
            resolve();
          }
        });
      });
    }

    async function copyWholeProject() {
      const temporaryProjectCopyPath = await copyExistingProjectFiles();
      await removeExistingProjectFilesFromCurrentLocation();
      await copyFilesIntoSubdir(temporaryProjectCopyPath);
      return;

      function copyExistingProjectFiles() {
        return new Promise((resolve, reject) => {
          temp.mkdir('pio-arduino-import', (err, dirPath) => {
            if (err) {
              reject(err);
            } else {
              fs.copy(projectPath, dirPath, {clobber: true, filter: skipVCS}, (err) => {
                if (err) {
                  reject(err);
                }
                resolve(dirPath);
              });
            }
          });
        });
      }

      function removeExistingProjectFilesFromCurrentLocation() {
        return new Promise((resolve, reject) => {
          fs.readdir(projectPath, (err, paths) => {
            if (err) {
              reject(err);
            } else {
              for (const fileName of paths.filter(skipVCS)) {
                fs.remove(path.join(projectPath, fileName));
              }
              resolve();
            }
          });
        });
      }

      function copyFilesIntoSubdir(copyPath) {
        return new Promise((resolve, reject) => {
          dstDir = path.join(projectPath, path.basename(projectPath));
          try {
            fs.copySync(copyPath, dstDir);
            resolve();
          } catch(e) {
            reject(e);
          }
        });
      }
    }

    function skipVCS(file) {
      const filesToKeep = ['.git'];
      return filesToKeep.indexOf(path.basename(file)) === -1;
    }

    function moveOriginalFilesToSrcDirectory() {
      fs.mkdirsSync(path.join(projectPath, 'src'));
      originalProjectFiles.forEach((fileName) => {
        const oldPath = path.join(projectPath, fileName);
        const newPath = path.join(projectPath, 'src', fileName);
        fs.renameSync(oldPath, newPath);
      });
    }

    function modifyPlatformioIni() {
      if (!keepCompatible && !useArduinoLibManager) {
        return;
      }
      const iniPath = path.join(projectPath, 'platformio.ini');

      let contentToPreserve = '';
      const fullConfig = fs.readFileSync(iniPath).toString();
      const envPosition = fullConfig.search(/^\[env:/m);
      if (envPosition > -1) {
        contentToPreserve = fullConfig.slice(0, envPosition);
      }

      const config = ini.parse(fullConfig);
      if (!config.platformio) {
        config.platformio = {};
      }

      if (keepCompatible) {
        config.platformio.src_dir = path.basename(projectPath);
      }
      if (useArduinoLibManager) {
        config.platformio.lib_dir = view.getLibManagerDirectory();
      }

      fs.writeFileSync(iniPath, contentToPreserve);
      fs.appendFileSync(iniPath, ini.stringify(config));
    }

    function addIncludeToInoFiles() {
      const dirsToLookIn = [path.join(projectPath, keepCompatible ? path.basename(projectPath) : 'src')];
      const filesToProcess = [];
      while (dirsToLookIn.length > 0) {  // Recursively look for *.ino files
        const dir = dirsToLookIn.splice(0, 1)[0];
        const content = fs.readdirSync(dir);
        for (const item of content) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSyncNoException(fullPath);
          if (!stat) {
            continue;
          }

          if (stat.isFile() && item.endsWith('.ino')) {
            filesToProcess.push(fullPath);
          } else if (stat.isDirectory()) {
            dirsToLookIn.push(fullPath);
          }
        }
      }

      let chain = Promise.resolve();
      for (const filePath of filesToProcess) {
        chain = chain.then(prependInclude(filePath));
      }
      return chain;

      function prependInclude(filePath) {
        return function() {
          const temporaryStream = temp.createWriteStream();
          return new Promise((resolve) => {
            const originStream = fs.createReadStream(filePath);
            const transform = new Transform({
              transform: function(chunk, encoding, callback) {
                if (!this.currentLineBuffer) {
                  this.currentLineBuffer = '';
                }

                const str = chunk.toString();
                for (const char of str) {
                  if ('\n' === char) {
                    if (/^#include\s+["<]Arduino\.h[">]/.test(this.currentLineBuffer)) {
                      // Abort copying process
                      resolve(false);
                      this.end();
                    }
                    this.currentLineBuffer = '';
                  } else {
                    this.currentLineBuffer += char;
                  }
                }

                callback(null, chunk);
              }
            });

            temporaryStream.on('finish', () => resolve(true));

            originStream.pipe(transform).pipe(temporaryStream);
          }).then((editIsNeeded) => {
            if (!editIsNeeded) {
              return;
            }
            return new Promise((resolve) => {
              const stream = fs.createWriteStream(filePath);
              stream.write('#include <Arduino.h>\n\n');
              fs.createReadStream(temporaryStream.path).pipe(stream);
              stream.on('finish', () => resolve());
            });
          }).then(() => {
            return new Promise((resolve, reject) => {
              fs.unlink(temporaryStream.path, (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          });
        };
      }
    }
  };
}
