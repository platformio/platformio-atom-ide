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

import fs from 'fs-extra';
import path from 'path';
import {Transform} from 'stream';
import temp from 'temp';
import ini from 'ini';
import {runAtomCommand, getBoards} from '../utils';
import {ImportArduinoProjectView} from './view';
import {initializeProject, installPlatformsForBoards} from '../init/command';
import {handleLibChanges} from '../maintenance';

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
    if (!keepCompatible) {
      chain = chain.then(storeOriginalFiles);
    }

    chain = chain.then(() => {
      return installPlatformsForBoards(view.getSelectedBoards(), getBoards(), view);
    });

    chain = chain.then(() => view.setStatus('Performing initialization...'));
    chain = chain.then(() => initializeProject(view.getSelectedBoards(), projectPath));

    if (!keepCompatible) {
      chain = chain.then(moveOriginalFilesToSrcDirectory);
    }

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

    function storeOriginalFiles() {
      return new Promise((resolve, reject) => {
        fs.readdir(projectPath, (err, files) => {
          if (err) {
            reject(err);
          } else {
            const filesToKeep = ['.git'];
            originalProjectFiles = files
              .filter((name) => filesToKeep.indexOf(name) === -1);
            resolve();
          }
        });
      });
    }

    function moveOriginalFilesToSrcDirectory() {
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
        config.platformio.src_dir = '.';
      }
      if (useArduinoLibManager) {
        config.platformio.lib_dir = view.getLibManagerDirectory();
      }

      fs.writeFileSync(iniPath, contentToPreserve);
      fs.appendFileSync(iniPath, ini.stringify(config));
    }

    function addIncludeToInoFiles() {
      const dirsToLookIn = [keepCompatible ? projectPath : path.join(projectPath, 'src')];
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
