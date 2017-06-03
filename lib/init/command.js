/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';


import { InitializeNewProjectView } from './view';
import { getActivePioProject } from '../project/helpers';


export function command() {
  // Initialize view
  var view = new InitializeNewProjectView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  // Set buttons handlers
  view.handleCancel = () => panel.destroy();
  view.handleInit = () => {
    const projectPath = view.getDirectory();
    const selectedBoards = view.getSelectedBoards();
    return installPlatformsForBoards(selectedBoards, view)
      .then(() => view.setStatus('Performing initialization...'))
      .then(() => initializeProject(selectedBoards, projectPath))
      .then(() => {
        atom.notifications.addSuccess('PlatformIO: Project has been successfully initialized!', {
          detail: 'The next files/directories were created in "' + projectPath + '"\n' +
          '"platformio.ini" - Project Configuration File\n' +
          '"src" - Put your source code here\n' +
          '"lib" - Put here project specific (private) libraries'
        });
        utils.runAtomCommand('build:refresh-targets');
      }, (reason) => {
        const title = 'PlatformIO: Failed to initialize PlatformIO project!';
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
    view.addDirectories(paths, getActivePioProject());
  }
}

export function initializeProject(boardIds, projectPath) {
  const boards = utils.getBoards();
  const args = ['init', '--ide', 'atom'];
  boardIds.forEach((boardId) => {
    args.push('--board');
    if ('id' in boards[boardId]) {
      args.push(boards[boardId].id);
    }
    else {
      args.push(boardId);
    }
  });
  args.push('--project-dir');
  args.push(projectPath);

  return utils.spawnPio(args);
}

function getPlatforms(boardIds) {
  const boards = utils.getBoards();
  const result = new Set();
  for (const boardId of boardIds) {
    result.add(boards[boardId].platform);
  }
  return result;
}

export function installPlatformsForBoards(boardIds, view) {
  let p = Promise.resolve();
  for (const platform of getPlatforms(boardIds)) {
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
      return utils.spawnPio(['platforms', 'install', platform]);
    };
  }
}
