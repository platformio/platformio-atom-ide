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
import {ProjectExamplesView} from './view';
import * as config from '../config';
import {ensureProjectsInited} from '../maintenance';


export function command() {
  const projects = getProjects(path.join(config.BASE_DIR, 'project-examples'));
  const view = new ProjectExamplesView(projects);
  const panel = atom.workspace.addModalPanel({item: view.getElement()});
  let canceled = false;

  view.handlePrepare = function() {
    const projects = view.getSelectedProjects();
    let step = 0;
    view.progress.max = projects.size;
    view.progress.style.display = 'block';
    for (const projectPath of projects) {
      view.progress.value = step;
      step += 1;
      if (!canceled) {
        view.setStatus(`Processing project ${projectPath}`);
        ensureProjectsInited([projectPath], true);
        atom.project.addPath(projectPath);
      }
      view.progress.value = 1;
    }
    view.setStatus('Done!');
    panel.destroy();
  };
  view.handleCancel = function() {
    canceled = true;
    panel.destroy();
  };

  // view.
}

function getProjects(examplesRoot) {
  const queue = [examplesRoot];
  const projects = {};
  while (queue.length > 0) {
    const dirPath = queue.splice(0, 1)[0];  // take the first element from the queue
    if (!dirPath) {
      continue;
    }
    const files = fs.readdirSync(dirPath);
    if (files.indexOf('platformio.ini') !== -1) {
      projects[dirPath] = dirPath.slice(examplesRoot.length + 1);
      continue;
    }
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSyncNoException(fullPath);
      if (stat && stat.isDirectory()) {
        queue.push(fullPath);
      }
    });
  }
  return projects;
}
