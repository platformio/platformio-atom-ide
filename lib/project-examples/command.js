'use babel';

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as config from '../config';
import {ProjectExamplesView} from './view';
import {ensureProjectsInited} from '../init/command';
import path from 'path';
import promisify from 'promisify-node';


const fsp = promisify('fs-extra');
const tempp = promisify('temp');


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
        const copyPath = await tempp.mkdir(`${path.basename(projectPath)}-`);
        await fsp.copy(projectPath, copyPath);
        await ensureProjectsInited([copyPath], true);
        atom.project.addPath(copyPath);
        processedPaths.push(copyPath);
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
