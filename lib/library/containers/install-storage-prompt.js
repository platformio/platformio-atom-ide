/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { getCustomStorages, saveCustomStorage } from '../helpers';

import SelectListView from 'atom-select-list';
import fs from 'fs-plus';
import { getPioProjects } from '../../project/helpers';
import path from 'path';


export default class LibraryInstallStoragePrompt {

  constructor() {
    this.selectListView = new SelectListView({
      items: this.getItems(),
      infoMessage: 'Install library to',
      filterKeyForItem: (item) => [item.name, item.path].join(' '),
      elementForItem: this.buildSelectListElement,
      didConfirmSelection: (item) => {
        if (item.path === 'custom') {
          atom.pickFolder(paths => {
            if (paths) {
              paths.forEach(p => {
                if (fs.isDirectorySync(p)) {
                  this.onDidStorageSelect(p);
                }
              });
              this.destroy();
            }
          });
        } else {
          this.onDidStorageSelect(item.path);
          this.destroy();
        }
      },
      didCancelSelection: () => {
        this.oncancel();
        this.destroy();
      }
    });

    this.promise = new Promise((resolve, reject) => {
      this.onselect = resolve;
      this.oncancel = reject;
    });

    this.panel = null;
  }

  getItems() {
    let items = getPioProjects().map(p => ({
      name: `Project: ${path.basename(p)}`,
      detail: p,
      path: p
    }));
    items = items.concat(getCustomStorages().map(p => ({
      name: `Storage: ${path.basename(p)}`,
      detail: p,
      path: p
    })));
    items.push({
      name: 'Global Library Storage',
      detail: 'Library will be accessible for all your projects',
      path: ''
    });
    items.push({
      name: 'Custom Library Storage',
      detail: 'You can use it later with <kbd>lib_extra_dirs</kbd> option in ' +
              '<kbd>platformio.ini</kbd>. <br>' +
              'Manage them in ' +
              '"PlatformIO IDE Settings > Custom Library Storages"',
      path: 'custom'
    });
    return items;
  }

  buildSelectListElement(item) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    const icon = document.createElement('span');
    icon.classList.add('icon', 'icon-file-directory');
    const project = document.createElement('span');
    project.textContent = item.name;
    span.appendChild(icon);
    span.appendChild(project);
    li.appendChild(span);
    const div = document.createElement('div');
    div.classList.add('text-subtle', 'text-smaller');
    div.innerHTML = item.detail;
    li.appendChild(div);
    return li;
  }

  onDidStorageSelect(path) {
    if (!getPioProjects().includes(path)) {
      saveCustomStorage(path);
    }
    this.onselect(path);
  }

  prompt() {
    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({
        item: this.selectListView
      });
      this.selectListView.focus();
    }
    return this.promise;
  }

  async destroy() {
    this.promise = null;
    if (this.panel) {
      this.panel.destroy();
    }
    await this.selectListView.destroy();
  }

}
