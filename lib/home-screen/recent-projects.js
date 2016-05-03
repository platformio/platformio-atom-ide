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
import {getRecentProjects} from './command';
import BaseView from '../base-view';
import {withTemplate} from '../utils';

@withTemplate(__dirname)
export class RecentProjectsView extends BaseView{

  buildElement() {
    const element = document.createElement('div');
    element.classList.add('recent-projects-wrapper');
    return element;
  }

  initialize() {
    this.populateProjects();
  }

  populateProjects() {
    this.element.textContent = '';
    return getRecentProjects().each(project => {
      const div = document.createElement('div');
      div.classList.add('recent-project-item');
      div.onclick = () => atom.project.addPath(project.path);

      const title = document.createElement('span');
      title.classList.add('recent-project-title');
      title.textContent = path.basename(project.path);
      div.appendChild(title);

      const projectPath = document.createElement('span');
      projectPath.classList.add('recent-project-path');
      projectPath.textContent = project.path;
      div.appendChild(projectPath);

      this.element.appendChild(div);
    }).catch(err => {
      atom.notifications.addError('An error occured during fetching recent projects', {
        detail: err.toString(),
        dismissable: true,
      });
      this.element.textContent = 'Failed to fetch a list of recent projects.';
    });
  }
}
