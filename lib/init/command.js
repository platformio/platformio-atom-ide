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

import child_process from 'child_process';
import {getPythonExecutable, runAtomCommand} from '../utils';
import {PLATFORMIO_BASE_ARGS} from '../constants';
import {InitializeNewProjectView} from './view';

export function command() {
  // Initialize view
  var view = new InitializeNewProjectView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  // Set buttons handlers
  view.handleCancel = () => panel.destroy();
  view.handleInit = () => {
    console.debug('Init');
    const pythonExecutable = getPythonExecutable();

    const projectPaths = atom.project.getPaths();
    if (0 === projectPaths.length) {
      atom.notifications.addWarning('Project has no open directories!', {
        detail: 'You must open folder ("File > Open folder..." command) first.',
      });
      panel.destroy();
    }

    var initArgs = PLATFORMIO_BASE_ARGS.concat(['init', '--ide', 'atom']);
    view.getSelectedBoards().forEach((boardId) => {
      initArgs.push('--board');
      initArgs.push(boardId);
    });

    projectPaths.forEach((path) => {
      console.debug('Converting', path);
      const args = initArgs.concat(['--project-dir', path]);
      const initResult = child_process.spawnSync(pythonExecutable, args);
      if (0 !== initResult.status) {
        let title = 'PlaftormIO: Failed to initialize PlatformIO project!';
        let msg = '' + initResult.stderr;
        atom.notifications.addError(title, {detail: msg});
        console.error(title);
        console.error(msg);
      } else {
        atom.notifications.addSuccess('PlatformIO: Project successfully initialized.', {
          detail: 'Directory under ' + path + ' has been converted to a PlatformIO project.',
        });
        runAtomCommand('build:refresh-targets');
      }
    });
    panel.destroy();
  };

  // Set available boards
  const pythonExecutable = getPythonExecutable();
  const boardsArgs = PLATFORMIO_BASE_ARGS.concat(['boards', '--json-output']);
  const boardsResult = child_process.spawnSync(pythonExecutable, boardsArgs);
  if (0 !== boardsResult.status) {
    let title = 'PlaftormIO: Failed to get boards list!';
    let msg = '' + boardsResult.stderr;
    atom.notifications.addError(title, {detail: msg});
    console.error(title);
    console.error(msg);
    return;
  }
  view.setBoards(JSON.parse('' + boardsResult.stdout));
}
