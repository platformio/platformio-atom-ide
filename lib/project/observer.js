/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { CompositeDisposable } from 'atom';
import ProjectIndexer from './indexer';
import fs from 'fs-plus';
import { getActivePioProject } from './helpers';

export default class ProjectObserver {

  static instance = null;

  constructor() {
    // Singleton
    if (ProjectObserver.instance) {
      return ProjectObserver.instance;
    }
    ProjectObserver.instance = this;

    this._indexers = [];
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.project.onDidChangePaths(::this.onProjectChanges));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'platformio-ide:maintenance.rebuild-index': ::this.rebuildActiveProject,
    }));
    this.subscriptions.add(atom.config.observe('platformio-ide.autoRebuildAutocompleteIndex', ::this.toggleActiveState));
  }

  async toggleActiveState(enabled) {
    if (enabled) {
      await this.activate();
    } else {
      this.deactivate();
    }
  }

  async activate() {
    await this.onProjectChanges(atom.project.getPaths());
  }

  deactivate() {}

  async onProjectChanges(currentPaths) {
    const previousPaths = this._indexers.map(indexer => indexer.projectPath);
    currentPaths = currentPaths.map(p => fs.realpathSync(p));

    for (const addedProjectPath of currentPaths.filter(path => !previousPaths.includes(path))) {
      const indexer = new ProjectIndexer(addedProjectPath);
      await indexer.activate();
      this.registerIndexer(indexer);
    }

    for (const removedProjectIndexer of this._indexers.filter(indexer => !currentPaths.includes(indexer.projectPath))) {
      this.unregisterIndexer(removedProjectIndexer);
    }
  }

  async registerIndexer(indexer) {
    this._indexers.push(indexer);
  }

  unregisterIndexer(indexer) {
    indexer.deactivate();
    this._indexers.splice(this._indexers.indexOf(indexer));
  }

  rebuildActiveProject() {
    const p = getActivePioProject();
    if (!p) {
      atom.notifications.addWarning('Can not find active PlatformIO project.', {
        detail: 'Make sure that an opened project you are trying to rebuid is ' +
          'a PlatformIO project (e.g., contains `platformio.ini`).'
      });
      return;
    }
    this._indexers.find(indexer => indexer.projectPath == p).doRebuild({
      verbose: true,
    });
  }

  destroy() {
    ProjectObserver.instance = null;
    this.subscriptions.dispose();
  }

}
