/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs-plus';
import path from 'path';


export function isPioProject(dir) {
  return fs.isFileSync(path.join(dir, 'platformio.ini'));
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
