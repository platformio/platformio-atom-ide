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
import {removeChildrenOf, getAvailableBoards} from '../utils';
import {BoardsSelectView} from '../boards-select/view';

export class ImportArduinoProjectView {

  constructor() {
    // Parse template and retrieve its root element
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    // Find important nodes
    this.boardsSelectWrapper = this.element.querySelector('.boards-select-wrapper');
    this.directoryInput = this.element.querySelector('.directory-input');
    this.pickDirectoryButton = this.element.querySelector('.pick-directory');
    this.keepCompatible = this.element.querySelector('.keep-compatible');
    this.doImportButton = this.element.querySelector('.controls .do-import');
    this.cancelButton = this.element.querySelector('.controls .cancel');

    // Set handlers
    this.doImportButton.onclick = () => this.handleImport();
    this.cancelButton.onclick = () => this.handleCancel();
    this.pickDirectoryButton.onclick = () => {
      atom.pickFolder((selectedPaths) => {
        if (!selectedPaths) {
          return;
        }
        if (selectedPaths.length > 1) {
          atom.notifications.addWarning('PlatformIO: Multiple directories have been selected', {
            detail: 'Importing more than one project at a time is not allowed.',
            dismissable: true,
          });
        }
        this.directoryInput.value = selectedPaths[0];
        this.updateImportButtonDisabled();
      });
    };

    this.initializeBoardsSelect();
  }

  initializeBoardsSelect() {
    return getAvailableBoards()
      .then((boards) => {
        removeChildrenOf(this.boardsSelectWrapper);
        this.boardsSelect = new BoardsSelectView(boards);
        this.boardsSelectWrapper.appendChild(this.boardsSelect.getElement());
        this.boardsSelect.handleSelectBoard = () => this.updateImportButtonDisabled();
      });
  }

  setDirectories(directories) {
    let option;
    for (let dir of directories) {
      option = document.createElement('option');
      option.value = dir;
      option.textContent = dir;
      this.directorySelect.appendChild(option);
    }
    if (this.directoryInput.children.length > 1) {
      this.element.querySelector('.directory-select-wrapper').style.display = 'block';
    }
  }

  getDirectory() {
    return this.directoryInput.value.toString();
  }

  getSelectedBoards() {
    return this.boardsSelect.getSelectedBoards();
  }

  getKeepCompatible() {
    return this.keepCompatible.checked;
  }

  updateImportButtonDisabled() {
    this.doImportButton.disabled =
      this.boardsSelect.getSelectedBoards().length > 0 || !this.getDirectory();
  }

  handleImport() {}
  handleCancel() {}

  getElement() {
    return this.element;
  }

  destroy() {
    this.element.remove();
  }
}
