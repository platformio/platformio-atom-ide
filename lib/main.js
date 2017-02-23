/** @babel */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as config from './config';
import * as init from './init/command';
import * as maintenance from './maintenance';
import * as utils from './utils';

import { checkDevelopmentUpdates, reinstallPIOCore } from './installer/util';
import { consumeRunInTerminal, runCmdsInTerminal } from './terminal';
import { getActivePioProject, synchronizeRecentProjects } from './project/util';

import { CompositeDisposable } from 'atom';
import HomeView from './home/view';
import InstallationManager from './installer/manager';
import PlatformIOBuildProvider from './build-provider';
import { command as donateCommand } from './donate/command';
import { command as importArduinoIDEProject } from './import-arduino-project/command';
import { openPIOHome } from './home/util';
import path from 'path';
import { command as serialMonitor } from './serial-monitor/command';
import { command as showProjectExamples } from './project-examples/command';

class PlatformIOIDEPackage {

  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.config = config.ATOM_CONFIG;
    this.consumeRunInTerminal = consumeRunInTerminal;
    this.highlightSubscriptions = null;
    this.busyService = null;
  }

  provideBuilder() {
    return PlatformIOBuildProvider;
  }

  activate() {
    maintenance.updateOSEnviron();
    this.startInstaller()
      .then(() => this.setupCommands())
      .then(() => synchronizeRecentProjects(atom.project.getPaths()))
      .then(() => donateCommand(true))
      .then(() => openPIOHome())
      .then(() => checkDevelopmentUpdates);
  }

  async startInstaller() {
    const im = new InstallationManager();
    if (im.locked()) {
      atom.notifications.addInfo('PlatformIO IDE installation has been suspended.', {
        detail: 'Seems like PlatformIO IDE Installer is already started in another window.',
        dismissable: true
      });
    }
    else if (await im.check()) {
      return Promise.resolve();
    }
    else {
      im.lock();
      try {
        await im.install();
      }
      catch (err) {
        utils.notifyError('InstallationManager', err);
      }
      im.unlock();
    }
    im.destroy();
    return Promise.reject();
  }

  setupCommands() {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'platformio-ide:initialize-new-project': () => init.command(),
      'platformio-ide:import-arduino-ide-project': () => importArduinoIDEProject(),

      'platformio-ide:maintenance.open-terminal': () => runCmdsInTerminal(['pio --help']),
      'platformio-ide:maintenance.serial-monitor': () => serialMonitor(),
      'platformio-ide:maintenance.serial-ports': () => runCmdsInTerminal(['pio device list']),

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
      'platformio-ide:maintenance.update-platformio': () => runCmdsInTerminal(['platformio update']),
      'platformio-ide:maintenance.upgrade-platformio': () => runCmdsInTerminal(['platformio upgrade']),

      'platformio-ide:piolpus-site': () => utils.openUrl('https://pioplus.com'),
      'platformio-ide:help-docs': () => utils.openUrl('http://docs.platformio.org/'),
      'platformio-ide:help-faq': () => utils.openUrl('http://docs.platformio.org/page/faq.html'),
      'platformio-ide:help.report-platformio-issue': () => utils.openUrl('https://github.com/platformio/platformio-core/issues'),
      'platformio-ide:help.community': () => utils.openUrl('https://community.platformio.org/'),

      'platformio-ide:help-twitter': () => utils.openUrl('https://twitter.com/PlatformIO_Org'),
      'platformio-ide:help-facebook': () => utils.openUrl('https://www.facebook.com/platformio'),

      'platformio-ide:help-website': () => utils.openUrl('http://platformio.org/'),
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

    // Refresh build targets on useBuiltinPIOCore change
    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.useBuiltinPIOCore', () => {
        utils.runAtomCommand('build:refresh-targets');
        maintenance.updateOSEnviron();
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.useDevelopmentPIOCore', () => {
        reinstallPIOCore();
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
      const editorPath = editor.getPath();
      if (!editorPath) {
        return;
      }

      // Handle *.ino and *.pde files as C++
      const extname = path.extname(editorPath);
      if (['.ino', '.pde'].includes(extname)) {
        editor.setGrammar(atom.grammars.grammarForScopeName('source.cpp'));
        maintenance.notifyLinterDisabledforArduino();
      }

      if ('platformio.ini' === path.basename(editorPath)) {
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
    if (this.busyService) {
      this.busyService = null;
    }
    init.cleanMiscCache();
    utils.cleanMiscCache();
  }

  consumeBusy(service) {
    this.busyService = service;
  }

  getBusyService() {
    return this.busyService;
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
