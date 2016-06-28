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

import BaseView from '../base-view';
import {BoardsSelectView} from '../boards-select/view';
import {getBoards, removeChildrenOf, withTemplate} from '../utils';

@withTemplate(__dirname)
export class InitializeNewProjectView extends BaseView {

  initialize() {
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
        this.addDirectories(selectedPaths, selectedPaths[selectedPaths.length - 1]);
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

  addDirectories(directories, activeDir) {
    for (const dir of directories) {
      const option = document.createElement('option');
      option.value = dir;
      option.textContent = dir;
      if (dir == activeDir) {
        option.selected = true;
      }
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
}
