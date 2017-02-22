/** @babel */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as utils from '../utils';

import path from 'path';

const RECENT_PROJECTS_MAX = 30;
const RECENT_PROJECTS_KEY = 'platformio-ide:recent-projects';

export function synchronizeRecentProjects(items) {
  const result = getRecentProjects();
  for (const item of items) {
    if (result.indexOf(item) === -1 && !item.startsWith('atom:')) {
      result.unshift(item);
    }
  }
  setRecentProjects(result);
}

export function getRecentProjects() {
  const items = localStorage.getItem(RECENT_PROJECTS_KEY);
  if (!items) {
    return [];
  }
  return JSON.parse(items);
}

function setRecentProjects(items) {
  localStorage.setItem(
    RECENT_PROJECTS_KEY,
    JSON.stringify(items.slice(0, RECENT_PROJECTS_MAX))
  );
}

export function removeRecentProject(item) {
  setRecentProjects(getRecentProjects().filter(_item => _item !== item));
}

export function isPioProject(dir) {
  return utils.isFile(path.join(dir, 'platformio.ini'));
}

export function getPioProjects() {
  return atom.project.getPaths().filter(p => isPioProject(p));
}

export function getActivePioProject() {
  const paths = getPioProjects();
  if (paths.length === 0) {
    return null;
  }
  const editor = atom.workspace.getActiveTextEditor();
  if (editor) {
    const filePath = editor.getPath();
    if (filePath) {
      const found = paths.find(p => filePath.startsWith(p + path.sep));
      if (found) {
        return found;
      }
    }
  }
  return paths[0];
}
