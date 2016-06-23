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

import * as maintenance from './maintenance';
import {AboutView} from './about/view';
import {CompositeDisposable} from 'atom';
import {HomeView} from './home-screen/view';
import {NO_ELIGIBLE_PROJECTS_FOUND} from './config';
import {PlatformIOBuildProvider} from './build-provider';
import config from './config';
import {consumeRunInTerminal} from './terminal';
import {command as donateCommand} from './donate/command';
import {command as importArduinoIDEProject} from './import-arduino-project/command';
import {command as installPlatformIO} from './install/command';
import path from 'path';
import {reinstallPlatformIO} from './install/command';
import {command as serialMonitor} from './serial-monitor/command';
import shell from 'shell';
import {command as showProjectExamples} from './project-examples/command';
import {getActiveProjectPath, runAtomCommand} from './utils';
import {command as initializeNewProject, rebuildIndexSync} from './init/command';
import {command as showHomeScreen, synchronizeRecentProjects} from './home-screen/command';


module.exports = {
  config: config,
  subscriptions: null,
  highlightSubscriptions: null,

  consumeRunInTerminal: consumeRunInTerminal,

  provideBuilder: function() {
    return PlatformIOBuildProvider;
  },

  activate: function() {
    // @TODO Hotfix for https://github.com/atom/atom/issues/11302
    if (!('PATH' in process.env) && 'Path' in process.env) {
      process.env.PATH = process.env.Path;
    }
    // Fix for https://github.com/platformio/platformio-atom-ide/issues/112
    process.env.LC_ALL = 'en_US.UTF-8';

    this.subscriptions = new CompositeDisposable();

    maintenance.updateOSEnviron();
    installPlatformIO()
      .then(() => this.setupCommands())
      .then(() => synchronizeRecentProjects(atom.project.getPaths()))
      .then(showHomeScreen)
      .then(() => donateCommand(true));
  },

  setupCommands: function() {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'platformio-ide:initialize-new-project': () => initializeNewProject(),
      'platformio-ide:import-arduino-ide-project': () => importArduinoIDEProject(),

      'platformio-ide:maintenance.open-terminal': () => maintenance.openTerminal('pio --help'),
      'platformio-ide:maintenance.libmanager-cli': () => maintenance.openTerminal('pio lib --help'),
      'platformio-ide:maintenance.serial-monitor': () => serialMonitor(),
      'platformio-ide:maintenance.serial-ports': () => maintenance.openTerminal('pio serialports list'),

      'platformio-ide:maintenance.rebuild-index': () => {
        const p = getActiveProjectPath();
        if (!p) {
          atom.notifications.addError('PlatformIO: Please open the project directory.');
          return;
        }
        if (p === NO_ELIGIBLE_PROJECTS_FOUND) {
          atom.notifications.addError('Can not find PlatformIO project.', {
            detail: 'Make sure that project you\'re trying to rebuid is a ' +
                    'PlatformIO project (e. g., contains `platformio.ini`).',
          });
          return;
        }
        return rebuildIndexSync(p);
      },
      'platformio-ide:maintenance.install-commands': () => maintenance.installCommands(),
      'platformio-ide:maintenance.update-platformio': () => maintenance.openTerminal('platformio update'),
      'platformio-ide:maintenance.upgrade-platformio': () => maintenance.openTerminal('platformio upgrade'),

      'platformio-ide:help-docs':
        () => shell.openExternal('http://docs.platformio.org/'),
      'platformio-ide:help-faq':
        () => shell.openExternal('http://docs.platformio.org/en/latest/faq.html'),
      'platformio-ide:help.report-platformio-issue':
        () => shell.openExternal('https://github.com/platformio/platformio/issues'),
      'platformio-ide:help.community':
        () => shell.openExternal('https://community.platformio.org/'),

      'platformio-ide:help-twitter':
        () => shell.openExternal('https://twitter.com/PlatformIO_Org'),
      'platformio-ide:help-facebook':
        () => shell.openExternal('https://www.facebook.com/platformio'),

      'platformio-ide:help-website':
        () => shell.openExternal('http://platformio.org/'),
      'platformio-ide:help-about':
        () => atom.workspace.open('platformio://about'),
      'platformio-ide:donate': () => donateCommand(),

      'platformio-ide:settings:pkg-platformio-ide':
        () => atom.workspace.open('atom://config/packages/platformio-ide/'),
      'platformio-ide:settings:pkg-platformio-ide-terminal':
        () => atom.workspace.open('atom://config/packages/platformio-ide-terminal/'),
      'platformio-ide:settings:pkg-build':
        () => atom.workspace.open('atom://config/packages/build/'),
      'platformio-ide:settings:pkg-linter':
        () => atom.workspace.open('atom://config/packages/linter/'),
      'platformio-ide:settings:pkg-tool-bar':
        () => atom.workspace.open('atom://config/packages/tool-bar/'),

      'platformio-ide:home-screen': () => showHomeScreen(true),
      'platformio-ide:project-examples': () => showProjectExamples(),
    }));

    // Refresh build targets on useBuiltinPlatformIO change
    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.useBuiltinPlatformIO', () => {
        runAtomCommand('build:refresh-targets');
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
      atom.config.onDidChange('platformio-ide.autoCloseSerialMonitor', () => {
        runAtomCommand('build:refresh-targets');
      })
    );

    for (const target of ['Build', 'Upload', 'Clean']) {
      this.subscriptions.add(atom.commands.add(
        'atom-workspace',
        `platformio-ide:target:${target.toLowerCase()}`,
        makeRunTargetCommand(target)
      ));
    }

    function makeRunTargetCommand(target) {
      return function() {
        const p = getActiveProjectPath();
        if (!p) {
          atom.notifications.addError('PlatformIO: Project does not have opened directories', {
            detail: 'Please open a directory with your PlatformIO project first.'
          });
          return;
        }
        if (p === NO_ELIGIBLE_PROJECTS_FOUND) {
          atom.notifications.addError('Can not find PlatformIO project.', {
            detail: 'Make sure that project you\'re trying to buid is a ' +
                    'PlatformIO project (e. g., contains `platformio.ini`).',
          });
          return;
        }

        const status = runAtomCommand(`platformio-ide:target:${target.toLowerCase()}-${p}`);
        if (!status) {
          atom.notifications.addError(`PlatformIO: Failed to run a command: ${target}`, {
            detail: 'Please make sure that "build" package is installed and activated.',
          });
        }
      };
    }

    this.subscriptions.add(atom.workspace.addOpener((uriToOpen) => {
      if ('platformio://about' === uriToOpen) {
        return new AboutView(uriToOpen);
      } else if ('platformio://home' === uriToOpen) {
        return new HomeView(uriToOpen);
      }
    }));

    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      // Handle *.ino and *.pde files as C++
      var extname = path.extname(editor.getPath());
      if (['.ino', '.pde'].indexOf(extname) !== -1 ) {
        editor.setGrammar(atom.grammars.grammarForScopeName('source.cpp'));
        maintenance.notifyLinterDisabledforArduino();
      }
      if (['.ino', '.pde', '.c', '.cpp', '.h'].indexOf(extname) !== -1) {
        maintenance.checkClang();
      }

      if ('platformio.ini' === path.basename(editor.getPath())) {
        editor.onDidSave(() => runAtomCommand('build:refresh-targets'));
      }
    }));

    this.subscriptions.add(atom.project.onDidChangePaths((projectPaths) => {
      maintenance.ensureProjectsInitedSync(projectPaths);
      maintenance.handleLibChanges(projectPaths);
      synchronizeRecentProjects(projectPaths);
    }));

    this.subscriptions.add(atom.config.observe('platformio-ide.autoRebuildAutocompleteIndex', (enabled) => {
      if (enabled) {
        maintenance.handleLibChanges(atom.project.getPaths());
      } else {
        maintenance.clearLibChangeWatchers();
      }
    }));

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.highlightActiveProject', (event) => {
        this.toggleActiveProjectHighlighter(event.newValue);
      })
    );
    this.toggleActiveProjectHighlighter(atom.config.get('platformio-ide.highlightActiveProject'));
  },

  toggleActiveProjectHighlighter: function(isEnabled) {
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
  },

  deactivate: function() {
    this.subscriptions.dispose();
    this.toolBar.removeItems();
    if (this.highlightSubscriptions) {
      this.highlightSubscriptions.dispose();
    }
    maintenance.clearLibChangeWatchers();
  },

  consumeToolBar: function(toolBar) {
    this.toolBar = toolBar('platformio-ide');

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

    this.toolBar.addSpacer();

    this.toolBar.addButton({
      icon: 'file-code',
      callback: 'platformio-ide:initialize-new-project',
      tooltip: 'Initialize new PlatformIO Project or modify existing...'
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
      iconset: 'fa',
      callback: 'platformio-ide:maintenance.libmanager-cli',
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
      tooltip: 'Settings'
    });

    this.toolBar.addButton({
      icon: 'question',
      callback: 'platformio-ide:help-docs',
      tooltip: 'PlatformIO Documentation'
    });
  }
};
