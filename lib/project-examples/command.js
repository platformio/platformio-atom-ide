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

import path from 'path';
import promisify from 'promisify-node';
import {ProjectExamplesView} from './view';
import * as config from '../config';
import {ensureProjectsInited} from '../maintenance';

const fsp = promisify('fs');


export async function command() {
  const projects = await getProjects(path.join(config.BASE_DIR, 'project-examples'));
  const view = new ProjectExamplesView(projects);
  const panel = atom.workspace.addModalPanel({item: view.getElement()});
  let canceled = false;

  view.handlePrepare = async function() {
    const projects = view.getSelectedProjects();
    let step = 0;
    const processedPaths = [];
    view.progress.max = projects.size;
    view.progress.style.display = 'block';
    for (const projectPath of projects) {
      view.progress.value = step;
      step += 1;
      if (!canceled) {
        view.setStatus(`Processing project "${path.basename(projectPath)}"`);
        await ensureProjectsInited([projectPath], true);
        atom.project.addPath(projectPath);
        processedPaths.push(projectPath);
      }
      view.progress.value = step;
    }
    if (canceled) {
      for (const projectPath of processedPaths) {
        atom.project.removePath(projectPath);
      }
    }
    panel.destroy();
  };
  view.handleCancel = function() {
    canceled = true;
    panel.destroy();
  };
}

async function getProjects(examplesRoot) {
  const queue = [examplesRoot];
  const projects = {};
  while (queue.length > 0) {
    const dirPath = queue.splice(0, 1)[0];  // take the first element from the queue
    if (!dirPath) {
      continue;
    }
    const files = await fsp.readdir(dirPath);
    if (files.indexOf('platformio.ini') !== -1) {
      projects[dirPath] = dirPath.slice(examplesRoot.length + 1);
      continue;
    }
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      try {
        const stat = await fsp.stat(fullPath);
        if (stat && stat.isDirectory() && file !== 'ide') {
          queue.push(fullPath);
        }
      } catch(e) {
        continue;
      }
    }
  }
  return projects;
}
