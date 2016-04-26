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
import fs from 'fs';
import {removeChildrenOf} from '../utils';


export class ProjectExamplesView {
  constructor(projects) {
    this.projects = projects;

    // Parse template and retrieve its root element
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    this.projectsSelect = this.element.querySelector('.projects-select');
    this.selectedProjectsUl = this.element.querySelector('.selected-projects');
    this.placeholder = this.element.querySelector('.selected-placeholder');
    this.prepareButton = this.element.querySelector('.do-prepare');
    this.cancelButton = this.element.querySelector('.cancel');
    this.progress = this.element.querySelector('.pio-project-examples-progress');
    this.currentStatus = this.element.querySelector('.current-status');
    this.commandStatusWrapper = this.element.querySelector('.command-status');
    this.commandStatusContent = this.commandStatusWrapper.querySelector('.content');
    this.commandStatusSpinner = this.commandStatusWrapper.querySelector('.icon');


    this.allProjects = {};
    this.selectedProjects = new Set();

    this.projectsSelect.onchange = (event) => {
      this.selectedProjects.add(event.target.value);
      this.filterChoices();
      this.renderSelected();
      this.updatePrepareButtonDisabled();
    };
    this.prepareButton.onclick = () => this.handlePrepare();
    this.cancelButton.onclick = () => this.handleCancel();

    this.setProjects(projects);
  }

  getSelectedProjects() {
    return this.selectedProjects;
  }

  setProjects(projects) {
    this.allProjects = projects;
    this.filterChoices();
  }

  filterChoices() {
    var defaultOption = document.createElement('option');
    defaultOption.textContent = '-- add project --';
    defaultOption.selected = true;
    defaultOption.disabled = true;

    const sortedKeys = Object.keys(this.allProjects).sort((a, b) => {
      if (this.allProjects[a] > this.allProjects[b]) {
        return 1;
      } else if (this.allProjects[a] < this.allProjects[b]) {
        return -1;
      } else {
        return 0;
      }
    });

    removeChildrenOf(this.projectsSelect);
    this.projectsSelect.appendChild(defaultOption);

    for (const projectPath of sortedKeys) {
      if (this.selectedProjects.has(projectPath)) {
        continue;
      }

      const option = document.createElement('option');
      option.value = projectPath;
      option.textContent = this.allProjects[projectPath];
      this.projectsSelect.appendChild(option);
    }
  }

  renderSelected() {
    this.checkPlaceholderAndUlVisibility();
    removeChildrenOf(this.selectedProjectsUl);
    this.selectedProjects.forEach((projectPath) => {
      this.selectedProjectsUl.appendChild(this.createSelected(projectPath));
    });
  }

  checkPlaceholderAndUlVisibility() {
    if (this.selectedProjects.length < 1) {
      this.placeholder.style.display = 'block';
      this.selectedProjectsUl.style.display = 'none';
    } else {
      this.placeholder.style.display = 'none';
      this.selectedProjectsUl.style.display = 'block';
    }
  }

  createSelected(projectPath) {
    const
      li = document.createElement('li'),
      name = document.createElement('span'),
      icon = document.createElement('span'),
      unselect = document.createElement('a');

    li['data-project-path'] = projectPath;

    name.textContent = this.allProjects[projectPath];

    icon.classList.add('icon');
    icon.classList.add('icon-x');

    unselect.href = '#';
    unselect.classList.add('unselect');
    unselect.onclick = (e) => this.handleRemove(e);
    unselect.appendChild(icon);

    li.appendChild(name);
    li.appendChild(unselect);

    return li;
  }

  handleRemove(event) {
    this.selectedProjects.delete(event.target.parentNode.parentNode['data-project-path']);
    event.target.parentNode.parentNode.remove();
    this.checkPlaceholderAndUlVisibility();
    this.filterChoices();
    this.updatePrepareButtonDisabled();
  }

  updatePrepareButtonDisabled() {
    this.prepareButton.disabled = this.selectedProjects.size === 0;
  }

  setStatus(text) {
    this.commandStatusWrapper.style.display = 'block';
    this.commandStatusContent.textContent = text;
  }

  getElement() {
    return this.element;
  }
}
