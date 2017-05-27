/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export const LOAD_PROJECTS = 'LOAD_PROJECTS';
export const SYNC_PROJECTS = 'SYNC_PROJECTS';
export const OPEN_PROJECT = 'OPEN_PROJECT';
export const REMOVE_PROJECT = 'REMOVE_PROJECT';

function action(type, payload = {}) {
  return { type, ...payload };
}

export const loadProjects = () => action(LOAD_PROJECTS);
export const syncProjects = items => action(SYNC_PROJECTS, { items });
export const openProject = projectPath => action(OPEN_PROJECT, { projectPath });
export const removeProject = projectPath => action(REMOVE_PROJECT, { projectPath });
