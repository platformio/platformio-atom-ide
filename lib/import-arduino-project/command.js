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
import path from 'path';
import ini from 'ini';
import temp from 'temp';
import {runAtomCommand} from '../utils';
import {ImportArduinoProjectView} from './view';
import {initializeProject} from '../init/command';

export function command() {
  // Initialize view
  var view = new ImportArduinoProjectView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  // Set buttons handlers
  view.handleCancel = () => panel.destroy();
  view.handleImport = () => {
    const projectPath = view.getDirectory();
    const keepCompatible = view.getKeepCompatible();

    let originalProjectFiles = [];

    let chain = Promise.resolve();
    if (!keepCompatible) {
      chain = chain.then(storeOriginalFiles);
    }

    chain = chain.then(() => initializeProject(view.getSelectedBoards(), projectPath));

    if (!keepCompatible) {
      chain = chain.then(moveOriginalFilesToSrcDirectory);
    } else {
      chain = chain.then(modifyPlatformioIni);
    }

    chain = chain.then(addIncludeToInoFiles);

    chain = chain.then(() => atom.project.addPath(projectPath));

    chain = chain.then(() => {
      atom.notifications.addSuccess('PlatformIO: Project has been successfully imported!', {
        detail: 'The next files/directories were created in "' + projectPath + '"\n' +
        '"platformio.ini" - Project Configuration File\n' +
        '"src" - Put your source code here\n' +
        '"lib" - Put here project specific (private) libraries',
        dismissable: true
      });
      runAtomCommand('build:refresh-targets');
    }).catch((reason) => {
      let title = 'PlaftormIO: Failed to import an Arduino IDE project!';
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
      const iniPath = path.join(projectPath, 'platformio.ini');
      const config = ini.parse(fs.readFileSync(iniPath).toString());
      config.platformio = {src_dir: '.'};
      return new Promise((resolve, reject) => {
        fs.writeFile(iniPath, ini.stringify(config), (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    function addIncludeToInoFiles() {
      let dirsToLookIn = [keepCompatible ? projectPath : path.join(projectPath, 'src')];
      let filesToProcess = [];
      let dir, content, item, fullPath, stat;
      while (dirsToLookIn.length > 0) {  // Recursively look for *.ino files
        dir = dirsToLookIn.splice(0, 1)[0];
        content = fs.readdirSync(dir);
        for (item of content) {
          fullPath = path.join(dir, item);
          stat = fs.statSyncNoException(fullPath);
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
      for (let filePath of filesToProcess) {
        chain = chain.then(() => prependInclude(filePath));
      }
      return chain;

      function prependInclude(filePath) {
        return new Promise((resolve) => {
          const temporaryStream = temp.createWriteStream();
          fs.createReadStream(filePath).pipe(temporaryStream);
          temporaryStream.on('finish', () => resolve(temporaryStream.path));
        }).then((temporaryFilePath) => {
          return new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(filePath);
            stream.write('#include <Arduino.h>\n\n');
            fs.createReadStream(temporaryFilePath).pipe(stream);
            stream.on('finish', () => fs.unlink(temporaryFilePath, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }));
          });
        });
      }
    }
  };
}
