/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from '../config';
import {ProjectExamplesView} from './view';
import fs from 'fs-plus';
import path from 'path';
import {rebuildIndex} from '../init/command';


export async function command() {
  const projects = await getProjects(path.join(config.PIO_HOME_DIR, 'project-examples'));
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
        await rebuildIndex(projectPath);
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
    const files = await fs.readdirSync(dirPath);
    if (files.indexOf('platformio.ini') !== -1) {
      projects[dirPath] = dirPath.slice(examplesRoot.length + 1);
      continue;
    }
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      try {
        if (fs.isDirectorySync(fullPath) && file !== 'ide') {
          queue.push(fullPath);
        }
      } catch(e) {
        continue;
      }
    }
  }
  return projects;
}
