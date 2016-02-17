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
import child_process from 'child_process';
import ini from 'ini';
import {runAtomCommand, getActiveProjectPath} from '../utils';
import {InitializeNewProjectView} from './view';

export function command() {
  // Initialize view
  var view = new InitializeNewProjectView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  // Set buttons handlers
  view.handleCancel = () => panel.destroy();
  view.handleInit = () => {
    const projectPath = view.getDirectory();
    return initializeProject(view.getSelectedBoards(), projectPath)
      .then(() => {
        atom.notifications.addSuccess('PlatformIO: Project has been successfully initialized!', {
          detail: 'The next files/directories were created in "' + projectPath + '"\n' +
          '"platformio.ini" - Project Configuration File\n' +
          '"src" - Put your source code here\n' +
          '"lib" - Put here project specific (private) libraries',
          dismissable: true
        });
        runAtomCommand('build:refresh-targets');
      }, (reason) => {
        let title = 'PlaftormIO: Failed to initialize PlatformIO project!';
        atom.notifications.addError(title, {detail: reason, dismissable: true});
        console.error(title);
        console.error(reason);
      })
      .then(() => {
        if (-1 === atom.project.getPaths().indexOf(projectPath)) {
          atom.project.addPath(projectPath);
        }
      })
      .then(() => panel.destroy(), () => panel.destroy());
  };

  const paths = atom.project.getPaths();
  if (paths.length > 0) {
    view.addDirectories(paths);
  }
}


export function rebuildIndex() {
  const projectPath = getActiveProjectPath();
  if (!projectPath) {
    atom.notifications.addError(
      'Please open the project directory.', {dismissable: true});
    return;
  }

  const iniPath = path.join(projectPath, 'platformio.ini');
  if (!fs.statSyncNoException(iniPath)) {
    atom.notifications.addError(
      'Please initialize new project first.', {dismissable: true});
    return;
  }

  const envNamePrefix = 'env:';
  const config = ini.parse(fs.readFileSync(iniPath).toString());
  const configSections = Object.keys(config);
  let rebuildOccured = false;
  for (let section of configSections) {
    if (section.indexOf(envNamePrefix) === 0 && config[section].board) {
      const result = child_process.spawnSync(
        'platformio', ['-f', '-c', 'atom', 'init', '--ide', 'atom', '-b', config[section].board],
        {cwd: projectPath});
      if (0 === result.status) {
        atom.notifications.addSuccess(
          'Index has been successfully rebuilt.', {dismissable: true});
      } else {
        atom.notifications.addWarning(
          'Failed to rebuild index.', {dismissable: true});
      }
      rebuildOccured = true;
      break;
    }
  }

  if (!rebuildOccured) {
    atom.notifications.addWarning(
      'Rebuild operation has been skipped (empty project).', {dismissable: true});
  }
}

export function initializeProject(boards, projectPath) {
  return new Promise((resolve, reject) => {
    let args = ['-f', '-c', 'atom', 'init', '--ide', 'atom'];
    boards.forEach((boardId) => {
      args.push('--board');
      args.push(boardId);
    });
    args.push('--project-dir');
    args.push(projectPath);

    let stderr = '';
    const child = child_process.spawn('platformio', args);
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('close', (code) => {
      if (0 !== code) {
        reject(stderr);
      } else {
        resolve();
      }
    });
  });
}
