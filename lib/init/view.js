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
import {clone, removeChildrenOf} from '../utils';

export class InitializeNewProjectView {

  constructor() {
    // Parse template and retrieve its root element
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    // Find important nodes
    this.boardsSelect = this.element.querySelector('.boards-select');
    this.doInitButton = this.element.querySelector('.controls .do-init');
    this.cancelButton = this.element.querySelector('.controls .cancel');
    this.selectedBoardsUl = this.element.querySelector('.selected-boards');
    this.placeholder = this.element.querySelector('.selected-placeholder');

    // Set handlers
    this.boardsSelect.onchange = (e) => this.handleSelectBoard(e);
    this.doInitButton.onclick = () => this.handleInit();
    this.cancelButton.onclick = () => this.handleCancel();

    this.allBoards = {};
    this.selectedBoards = new Set();
  }

  setBoards(boards) {
    this.allBoards = clone(boards);
    this.filterBoardsChoices();
  }

  getSelectedBoards() {
    return this.selectedBoards;
  }

  filterBoardsChoices(event) {
    var defaultOption = document.createElement('option');
    defaultOption.textContent = '-- choose a board (one at a time) --';
    defaultOption.selected = true;
    defaultOption.disabled = true;

    var newOptions = [defaultOption], option, board;
    for (let boardId in this.allBoards) {
      if (!this.allBoards.hasOwnProperty(boardId)) continue;
      board = this.allBoards[boardId];

      // Hide already selected boards
      if (this.selectedBoards.has(boardId)) continue;

      option = document.createElement('option');
      option.value = boardId;
      option.textContent = board.name;
      newOptions.push(option);
    }

    removeChildrenOf(this.boardsSelect);
    for (let i = 0; i < newOptions.length; i++) {
      this.boardsSelect.appendChild(newOptions[i]);
    }
  }

  handleSelectBoard(event) {
    this.selectedBoards.add(event.target.value);
    this.filterBoardsChoices();
    this.renderSelectedBoards();
    this.updateInitButtonDisabled();
  }

  updateInitButtonDisabled() {
    this.doInitButton.disabled = this.selectedBoards.length > 0;
  }

  renderSelectedBoards() {
    this.checkPlaceholderAndUlVisibility();
    removeChildrenOf(this.selectedBoardsUl);
    this.selectedBoards.forEach((boardId) => {
      this.selectedBoardsUl.appendChild(this.createSelected(boardId));
    });
  }



  createSelected(boardId) {
    var li = document.createElement('li'),
        name = document.createElement('span'),
        icon = document.createElement('span'),
        unselect = document.createElement('a');

    li['data-board-id'] = boardId;

    name.textContent = this.allBoards[boardId].name;

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
    this.selectedBoards.delete(event.target.parentNode.parentNode['data-board-id']);
    event.target.parentNode.parentNode.remove();
    this.checkPlaceholderAndUlVisibility();
    this.filterBoardsChoices();
    this.updateInitButtonDisabled();
  }

  checkPlaceholderAndUlVisibility() {
    if (this.selectedBoards.length < 1) {
      this.placeholder.style.display = 'block';
      this.selectedBoardsUl.style.display = 'none';
    } else {
      this.placeholder.style.display = 'none';
      this.selectedBoardsUl.style.display = 'block';
    }
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

export class InitializeNewProjectViewBak {
  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
    this.tooltipSubscriptions.dispose();
  }

  getElement() {
    return this.element;
  }
}
