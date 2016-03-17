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

import fs from 'fs';
import path from 'path';
import {removeChildrenOf, getBoards} from '../utils';
import {BoardsSelectView} from '../boards-select/view';

export class InitializeNewProjectView {

  constructor() {
    // Parse template and retrieve its root element
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    // Find important nodes
    this.boardsSelectWrapper = this.element.querySelector('.boards-select-wrapper');
    this.directorySelect = this.element.querySelector('.directory-select');
    this.otherDirectoryButton = this.element.querySelector('.other-directory');
    this.doInitButton = this.element.querySelector('.controls .do-init');
    this.cancelButton = this.element.querySelector('.controls .cancel');
    this.commandStatusWrapper = this.element.querySelector('.command-status');
    this.commandStatusContent = this.commandStatusWrapper.querySelector('.content');
    this.commandStatusSpinner = this.commandStatusWrapper.querySelector('.icon');

    // Set handlers
    this.otherDirectoryButton.onclick = () => {
      atom.pickFolder((selectedPaths) => {
        if (!selectedPaths) {
          return;
        }
        this.addDirectories(selectedPaths);
        this.directorySelect.value = selectedPaths[selectedPaths.length - 1];
        this.updateInitButtonDisabled();
      });
    };
    this.doInitButton.onclick = () => {
      this.doInitButton.textContent = 'Initializing...';
      this.doInitButton.disabled = true;
      this.handleInit();
    };
    this.cancelButton.onclick = () => this.handleCancel();

    this.initializeBoardsSelect();
  }

  initializeBoardsSelect() {
    const boards = getBoards();
    removeChildrenOf(this.boardsSelectWrapper);
    this.boardsSelect = new BoardsSelectView(boards);
    this.boardsSelectWrapper.appendChild(this.boardsSelect.getElement());
    this.boardsSelect.handleSelectBoard = () => this.updateInitButtonDisabled();
  }

  addDirectories(directories) {
    for (const dir of directories) {
      const option = document.createElement('option');
      option.value = dir;
      option.textContent = dir;
      this.directorySelect.appendChild(option);
    }
  }

  getDirectory() {
    return this.directorySelect.value;
  }

  getSelectedBoards() {
    return this.boardsSelect.getSelectedBoards();
  }

  updateInitButtonDisabled() {
    const boardsSelected = this.boardsSelect && this.getSelectedBoards().size > 0;
    const directorySelected = this.directorySelect.value.toString().length > 0;
    this.doInitButton.disabled = !boardsSelected || !directorySelected;
  }

  setStatus(text) {
    this.commandStatusWrapper.style.display = 'block';
    this.commandStatusContent.textContent = text;
  }

  handleInit() {}
  handleCancel() {}

  getElement() {
    return this.element;
  }

  destroy() {
    this.element.remove();
  }
}
