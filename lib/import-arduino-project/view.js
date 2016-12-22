'use babel';

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

import {getBoards, removeChildrenOf, withTemplate} from '../utils';
import BaseView from '../base-view';
import {BoardsSelectView} from '../boards-select/view';
import fs from 'fs';
import os from 'os';
import path from 'path';

@withTemplate(__dirname)
export class ImportArduinoProjectView extends BaseView {

  initialize() {
    // Find important nodes
    this.boardsSelectWrapper = this.element.querySelector('.boards-select-wrapper');
    this.directoryInput = this.element.querySelector('.directory-input');
    this.pickDirectoryButton = this.element.querySelector('.pick-directory');
    this.keepCompatible = this.element.querySelector('.keep-compatible');
    this.useArduinoLibManager = this.element.querySelector('.use-arduino-lib-manager');
    this.libManagerDirectory = this.element.querySelector('.lib-manager-dir');
    this.libManagerInputWrapper = this.element.querySelector('.lib-manager-input-wrapper');
    this.otherButton = this.element.querySelector('.other');
    this.doImportButton = this.element.querySelector('.controls .do-import');
    this.cancelButton = this.element.querySelector('.controls .cancel');
    this.commandStatusWrapper = this.element.querySelector('.command-status');
    this.commandStatusContent = this.commandStatusWrapper.querySelector('.content');
    this.commandStatusSpinner = this.commandStatusWrapper.querySelector('.icon');

    // Set handlers
    this.useArduinoLibManager.onclick = (event) => {
      if (event.target.checked) {
        this.libManagerInputWrapper.style.display = 'block';
      } else {
        this.libManagerInputWrapper.style.display = 'none';
      }
      this.updateImportButtonDisabled();
    };
    this.otherButton.onclick = () => {
      atom.pickFolder((selectedPaths) => {
        if (!selectedPaths) {
          return;
        }
        this.libManagerDirectory.value = selectedPaths[0];
        this.updateImportButtonDisabled();
      });
    };
    this.doImportButton.onclick = () => {
      this.doImportButton.textContent += '...';
      this.doImportButton.disabled = true;
      this.handleImport();
    };
    this.cancelButton.onclick = () => this.handleCancel();
    this.pickDirectoryButton.onclick = () => {
      atom.pickFolder((selectedPaths) => {
        if (!selectedPaths) {
          return;
        }
        if (selectedPaths.length > 1) {
          atom.notifications.addWarning('PlatformIO: Multiple directories have been selected', {
            detail: 'Importing more than one project at a time is not allowed.'
          });
        }
        if (fs.statSyncNoException(path.join(selectedPaths[0], 'platformio.ini'))) {
          atom.notifications.addWarning('PlatformIO: Invalid directory', {
            detail: 'Selected directory is already a PlatformIO project.'
          });
          return;
        }

        this.directoryInput.value = selectedPaths[0];
        this.updateImportButtonDisabled();
      });
    };

    this.setDefaultLibDir();
    this.initializeBoardsSelect();
  }

  initializeBoardsSelect() {
    const boards = getBoards();
    removeChildrenOf(this.boardsSelectWrapper);
    this.boardsSelect = new BoardsSelectView(boards);
    this.boardsSelectWrapper.appendChild(this.boardsSelect.getElement());
    this.boardsSelect.handleSelectBoard = () => this.updateImportButtonDisabled();
  }

  setDefaultLibDir() {
    let defaultLibDir = '';
    if (os.platform().indexOf('win32') > -1) {
      defaultLibDir = '~\\Documents\\Arduino\\libraries';
    } else if (os.platform().indexOf('darwin') > -1) {
      defaultLibDir = '~/Documents/Arduino/Libraries';
    } else if (os.platform().indexOf('linux') > -1) {
      defaultLibDir = '~/Arduino/Libraries';
    }
    this.libManagerDirectory.value = defaultLibDir;
  }

  setDirectories(directories) {
    for (const dir of directories) {
      const option = document.createElement('option');
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

  getUseArduinoLibManager() {
    return this.useArduinoLibManager.checked;
  }

  getLibManagerDirectory() {
    return this.libManagerDirectory.value.toString();
  }

  updateImportButtonDisabled() {
    this.doImportButton.disabled =
      this.boardsSelect && this.getSelectedBoards().size < 1 || !this.getDirectory() ||
      (this.getUseArduinoLibManager() && !this.getLibManagerDirectory());
  }

  setStatus(text) {
    this.commandStatusWrapper.style.display = 'block';
    this.commandStatusContent.textContent = text;
  }

  handleImport() {}
  handleCancel() {}
}
