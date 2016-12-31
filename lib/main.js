/** @babel */

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

import * as init from './init/command';
import * as maintenance from './maintenance';
import * as utils from './utils';

import { getActivePioProject, synchronizeRecentProjects } from './project/util';

import { CompositeDisposable } from 'atom';
import HomeView from './home/view';
import PlatformIOBuildProvider from './build-provider';
import config from './config';
import { consumeRunInTerminal } from './terminal';
import { command as donateCommand } from './donate/command';
import { command as importArduinoIDEProject } from './import-arduino-project/command';
import { command as installPlatformIO } from './install/command';
import { openPIOHome } from './home/util';
import path from 'path';
import { reinstallPlatformIO } from './install/command';
import { command as serialMonitor } from './serial-monitor/command';
import shell from 'shell';
import { command as showProjectExamples } from './project-examples/command';

class PlatformIOIDEPackage {

  constructor() {
    this.config = config;
    this.consumeRunInTerminal = consumeRunInTerminal;
    this.subscriptions = null;
    this.highlightSubscriptions = null;
    this.busyRegistry = null;
  }

  provideBuilder() {
    return PlatformIOBuildProvider;
  }

  activate() {
    maintenance.updateOSEnviron();
    this.subscriptions = new CompositeDisposable();
    installPlatformIO()
      .then(() => this.setupCommands())
      .then(() => synchronizeRecentProjects(atom.project.getPaths()))
      .then(openPIOHome)
      .then(() => donateCommand(true))
      .then(() => maintenance.setupActivationHooks());
  }

  setupCommands() {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'platformio-ide:initialize-new-project': () => init.command(),
      'platformio-ide:import-arduino-ide-project': () => importArduinoIDEProject(),

      'platformio-ide:maintenance.open-terminal': () => maintenance.openTerminal('pio --help'),
      'platformio-ide:maintenance.libraries': () => atom.workspace.open('platformio://lib'),
      'platformio-ide:maintenance.serial-monitor': () => serialMonitor(),
      'platformio-ide:maintenance.serial-ports': () => maintenance.openTerminal('pio serialports list'),

      'platformio-ide:maintenance.rebuild-index': () => {
        const p = getActivePioProject();
        if (!p) {
          atom.notifications.addWarning('Can not find active PlatformIO project.', {
            detail:
              'Make sure that an opened project you are trying to rebuid is ' +
              'a PlatformIO project (e.g., contains `platformio.ini`).'
          });
          return;
        }
        return init.intendToPerformIndexRebuild(p);
      },
      'platformio-ide:maintenance.install-commands': () => maintenance.installCommands(),
      'platformio-ide:maintenance.update-platformio': () => maintenance.openTerminal('platformio update'),
      'platformio-ide:maintenance.upgrade-platformio': () => maintenance.openTerminal('platformio upgrade'),

      'platformio-ide:piolpus-site': () => shell.openExternal('https://pioplus.com'),
      'platformio-ide:help-docs': () => shell.openExternal('http://docs.platformio.org/'),
      'platformio-ide:help-faq': () => shell.openExternal('http://docs.platformio.org/page/faq.html'),
      'platformio-ide:help.report-platformio-issue': () => shell.openExternal('https://github.com/platformio/platformio-core/issues'),
      'platformio-ide:help.community': () => shell.openExternal('https://community.platformio.org/'),

      'platformio-ide:help-twitter': () => shell.openExternal('https://twitter.com/PlatformIO_Org'),
      'platformio-ide:help-facebook': () => shell.openExternal('https://www.facebook.com/platformio'),

      'platformio-ide:help-website': () => shell.openExternal('http://platformio.org/'),
      'platformio-ide:help-about': () => atom.workspace.open('platformio://home/about'),
      'platformio-ide:donate': () => donateCommand(),

      'platformio-ide:settings:pkg-platformio-ide': () => atom.workspace.open('atom://config/packages/platformio-ide/'),
      'platformio-ide:settings:pkg-platformio-ide-terminal': () => atom.workspace.open('atom://config/packages/platformio-ide-terminal/'),
      'platformio-ide:settings:pkg-build': () => atom.workspace.open('atom://config/packages/build/'),
      'platformio-ide:settings:pkg-file-icons': () => atom.workspace.open('atom://config/packages/file-icons/'),
      'platformio-ide:settings:pkg-linter': () => atom.workspace.open('atom://config/packages/linter/'),
      'platformio-ide:settings:pkg-minimap': () => atom.workspace.open('atom://config/packages/minimap/'),
      'platformio-ide:settings:pkg-tool-bar': () => atom.workspace.open('atom://config/packages/tool-bar/'),

      'platformio-ide:home': () => openPIOHome(true),
      'platformio-ide:project-examples': () => showProjectExamples(),
    }));

    // Refresh build targets on useBuiltinPlatformIO change
    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.useBuiltinPlatformIO', () => {
        utils.runAtomCommand('build:refresh-targets');
        maintenance.updateOSEnviron();
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.useDevelopPlatformIO', (event) => {
        reinstallPlatformIO(event.newValue);
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.customPATH', (event) => {
        maintenance.handleCustomPATH(event.newValue, event.oldValue);
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.showPlatformIOFiles', () => {
        maintenance.handleShowPlatformIOFiles();
      })
    );
    maintenance.handleShowPlatformIOFiles();

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.autoCloseSerialMonitor', () => {
        utils.runAtomCommand('build:refresh-targets');
      })
    );

    for (const target of ['Build', 'Upload', 'Clean', 'Test']) {
      this.subscriptions.add(atom.commands.add(
        'atom-workspace',
        `platformio-ide:target:${target.toLowerCase()}`,
        makeRunTargetCommand(target)
      ));
    }

    function makeRunTargetCommand(target) {
      return function() {
        const p = getActivePioProject();
        if (!p) {
          atom.notifications.addWarning('Can not find active PlatformIO project.', {
            detail:
              'Make sure that an opened project you are trying to rebuid is ' +
              'a PlatformIO project (e.g., contains `platformio.ini`).'
          });
          return;
        }

        const status = utils.runAtomCommand(`platformio-ide:target:${target.toLowerCase()}-${p}`);
        if (!status) {
          atom.notifications.addError(`PlatformIO: Failed to run a command: ${target}`, {
            detail: 'Please make sure that "build" package is installed and activated.',
          });
        }
      };
    }

    this.subscriptions.add(atom.workspace.addOpener((uriToOpen) => {
      if (uriToOpen.startsWith('platformio://home')) {
        return new HomeView({uri: uriToOpen});
      }
    }));

    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      // Handle *.ino and *.pde files as C++
      var extname = path.extname(editor.getPath());
      if (['.ino', '.pde'].indexOf(extname) !== -1) {
        editor.setGrammar(atom.grammars.grammarForScopeName('source.cpp'));
        maintenance.notifyLinterDisabledforArduino();
      }
      if (['.ino', '.pde', '.c', '.cpp', '.h'].indexOf(extname) !== -1) {
        maintenance.checkClang();
      }

      if ('platformio.ini' === path.basename(editor.getPath())) {
        editor.onDidSave(() => utils.runAtomCommand('build:refresh-targets'));
      }
    }));

    this.subscriptions.add(atom.project.onDidChangePaths((projectPaths) => {
      utils.runAtomCommand('tree-view:show');
      init.ensureProjectsInited(projectPaths);
      init.handleLibChanges(projectPaths);
      synchronizeRecentProjects(projectPaths);
    }));

    this.subscriptions.add(atom.config.observe('platformio-ide.autoRebuildAutocompleteIndex', (enabled) => {
      if (enabled) {
        init.handleLibChanges(atom.project.getPaths());
      } else {
        init.clearLibChangeWatchers();
      }
    }));

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.highlightActiveProject', (event) => {
        this.toggleActiveProjectHighlighter(event.newValue);
      })
    );
    this.toggleActiveProjectHighlighter(atom.config.get('platformio-ide.highlightActiveProject'));
  }

  toggleActiveProjectHighlighter(isEnabled) {
    const doHighlight = () => maintenance.highlightActiveProject(isEnabled);

    if (isEnabled) {
      if (!this.highlightSubscriptions) {
        this.highlightSubscriptions = new CompositeDisposable();
      }
      this.highlightSubscriptions.add(atom.workspace.onDidStopChangingActivePaneItem(doHighlight));
      this.highlightSubscriptions.add(atom.project.onDidChangePaths(doHighlight));
    } else {
      if (this.highlightSubscriptions) {
        this.highlightSubscriptions.dispose();
        this.highlightSubscriptions = null;
      }
    }
    doHighlight();
  }

  deactivate() {
    this.subscriptions.dispose();
    if (this.highlightSubscriptions) {
      this.highlightSubscriptions.dispose();
    }
    init.clearLibChangeWatchers();
    if (this.toolBar) {
      this.toolBar.removeItems();
      this.toolBar = null;
    }
    if (this.busyRegistry) {
      this.busyRegistry = null;
    }
    init.cleanMiscCache();
    utils.cleanMiscCache();
  }

  consumeBusy(registry) {
    this.busyRegistry = registry;
  }

  getBusyRegister() {
    return this.busyRegistry;
  }

  consumeToolBar(toolBar) {
    this.toolBar = toolBar('platformio-ide');

    this.toolBar.addButton({
      icon: 'home',
      callback: 'platformio-ide:home',
      tooltip: 'PlatformIO Home'
    });

    this.toolBar.addButton({
      icon: 'check',
      callback: 'platformio-ide:target:build',
      tooltip: 'PlatformIO: Build'
    });

    this.toolBar.addButton({
      icon: 'arrow-right',
      callback: 'platformio-ide:target:upload',
      tooltip: 'PlatformIO: Upload'
    });

    this.toolBar.addButton({
      icon: 'trashcan',
      callback: 'platformio-ide:target:clean',
      tooltip: 'PlatformIO: Clean'
    });

    this.toolBar.addButton({
      icon: 'checklist',
      callback: 'build:select-active-target',
      tooltip: 'Run other target...'
    });

    this.toolBar.addButton({
      icon: 'fold',
      callback: 'build:toggle-panel',
      tooltip: 'Toggle Build Panel'
    });

    this.toolBar.addSpacer();

    this.toolBar.addButton({
      icon: 'file-code',
      callback: 'platformio-ide:initialize-new-project',
      tooltip: 'Initialize or Update PlatformIO Project'
    });

    this.toolBar.addButton({
      icon: 'file-directory',
      callback: 'application:add-project-folder',
      tooltip: 'Open Project Folder...'
    });

    this.toolBar.addButton({
      icon: 'search',
      callback: 'project-find:show',
      tooltip: 'Find in Project...'
    });

    this.toolBar.addSpacer();

    this.toolBar.addButton({
      icon: 'terminal',
      callback: 'platformio-ide:maintenance.open-terminal',
      tooltip: 'Terminal'
    });

    this.toolBar.addButton({
      icon: 'code',
      callback: 'platformio-ide:maintenance.libraries',
      tooltip: 'Library Manager'
    });

    this.toolBar.addButton({
      icon: 'plug',
      callback: 'platformio-ide:maintenance.serial-monitor',
      tooltip: 'Serial Monitor'
    });

    this.toolBar.addSpacer();

    this.toolBar.addButton({
      icon: 'gear',
      callback: 'application:show-settings',
      tooltip: 'Atom Settings'
    });
  }
}

const pioide = new PlatformIOIDEPackage();
export default pioide;
