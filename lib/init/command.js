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
import {runAtomCommand, spawnPio} from '../utils';
import {InitializeNewProjectView} from './view';

export function command() {
  // Initialize view
  var view = new InitializeNewProjectView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  // Set buttons handlers
  view.handleCancel = () => panel.destroy();
  view.handleInit = () => {
    const projectPath = view.getDirectory();
    const selectedBoards = view.getSelectedBoards();
    return installPlatformsForBoards(selectedBoards, view.allBoards, view)
      .then(() => initializeProject(selectedBoards, projectPath))
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


export function rebuildIndex(projectPath) {
  if (!projectPath) {
    atom.notifications.addError(
      'PlaftormIO: Please open the project directory.');
    return;
  }

  const iniPath = path.join(projectPath, 'platformio.ini');
  if (!fs.statSyncNoException(iniPath)) {
    atom.notifications.addError(
      'PlaftormIO: Please initialize new project first.');
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
          'PlaftormIO: C/C++ Project Index (for Autocomplete, Linter) has been successfully rebuilt.');
      } else {
        atom.notifications.addWarning(
          'PlaftormIO: Failed to rebuild C/C++ Project Index (for Autocomplete, Linter).');
      }
      rebuildOccured = true;
      break;
    }
  }

  if (!rebuildOccured) {
    atom.notifications.addWarning(
      'PlaftormIO: Rebuild operation has been skipped (empty project).');
  }
}

export function initializeProject(boards, projectPath) {
  const args = ['init', '--ide', 'atom'];
  boards.forEach((boardId) => {
    args.push('--board');
    args.push(boardId);
  });
  args.push('--project-dir');
  args.push(projectPath);

  return spawnPio(args);
}

function getPlatforms(boardIds, boardsInfo) {
  const result = new Set();
  for (let boardId of boardIds) {
    result.add(boardsInfo[boardId].platform);
  }
  return result;
}

export function installPlatformsForBoards(boardIds, boardsInfo, view) {
  let p = Promise.resolve();
  for (let platform of getPlatforms(boardIds, boardsInfo)) {
    p = p.then(_setStatus(platform))
         .then(_installPlatform(platform));
  }
  return p;

  function _setStatus(platform) {
    return function() {
      return view.setStatus(`Installing platform: ${platform}`);
    };
  }

  function _installPlatform(platform) {
    return function() {
      return spawnPio(['platforms', 'install', platform]);
    };
  }
}
