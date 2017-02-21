/** @babel */

/**
 * Copyright 2016-present Ivan Kravets <me@ikravets.com>
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
