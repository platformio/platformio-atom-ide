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

import Dexie from 'dexie';
import fs from 'fs';
import { notifyError } from '../utils';
import path from 'path';

const RECENT_PROJECTS_MAX = 30;

const db = new Dexie('platformio-ide');
db.version(1).stores({projects: 'path,lastSeen'});
db.open().catch((error) =>
  notifyError('Failed to open a database', error));

export function synchronizeRecentProjects(paths) {
  paths = paths.filter(p => !p.startsWith('atom:'));
  return db.transaction('rw', db.projects, function() {
    const processedPaths = new Set();
    const now = Date.now();
    return db.projects.where('path').anyOf(paths)
      .modify(project => {
        project.lastSeen = now;
        processedPaths.add(project.path);
      })
      .then(function addUnprocessedProjects() {
        return db.projects.bulkPut(
          paths
            .filter(p => !processedPaths.has(p))
            .map(p => ({path: p, lastSeen: now}))
        );
      })
      .then(function removeOldProjects() {
        return getRecentProjects()
          .last()
          .then(project => {
            if (project) {
              return db.projects
                .where('lastSeen').below(project.lastSeen)
                .delete();
            }
          });
      });
  }).catch((error) =>
    notifyError('DB::synchronizeRecentProjects', error));
}

export function getRecentProjects() {
  return db.projects
    .orderBy('lastSeen')
    .reverse()
    .limit(RECENT_PROJECTS_MAX);
}

export function removeRecentProject(project) {
  return db.projects
    .delete(project.path);
}

export function isPioProject(dir) {
  const stat = fs.statSyncNoException(path.join(dir, 'platformio.ini'));
  return stat && stat.isFile();
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
