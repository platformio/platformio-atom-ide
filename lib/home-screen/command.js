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

import {db} from '../db';

const RECENT_PROJECTS_NUMBER = 5;

export function command(skipCheck=true) {
  if (skipCheck || atom.config.get('platformio-ide.showHomeScreen')) {
    atom.workspace.open('platformio://home');
  }
}

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
  }).catch(error => {
    console.error(error);
  });
}

export function getRecentProjects() {
  return db.projects
    .orderBy('lastSeen')
    .reverse()
    .limit(RECENT_PROJECTS_NUMBER);
}
