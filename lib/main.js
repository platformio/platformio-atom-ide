/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from './config';
import * as init from './init/command';
import * as maintenance from './maintenance';
import * as utils from './utils';

import { TerminalConsumer, runCmdsInTerminal } from './services/terminal';
import { checkIDEUpdates, reinstallIDE } from './installer/ide';
import { getActivePioProject, synchronizeRecentProjects } from './project/helpers';

import BuildProvider from './services/build';
import { BusyConsumer } from './services/busy';
import { CompositeDisposable } from 'atom';
import { DebuggerConsumer } from './services/debugger';
import HomeIndex from './home/index';
import InstallationManager from './installer/manager';
import { ToolbarConsumer } from './services/toolbar';
import { command as donateCommand } from './donate/command';
import { command as importArduinoIDEProject } from './import-arduino-project/command';
import { maybeAuthModal } from './account/helpers';
import { openPIOHome } from './home/helpers';
import path from 'path';
import { reinstallPIOCore } from './installer/helpers';
import { command as serialMonitor } from './serial-monitor/command';
import { command as showProjectExamples } from './project-examples/command';


class PlatformIOIDEPackage {

  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.config = config.ATOM_CONFIG;
    this.highlightSubscriptions = null;

    // services
    this.provideBuilder = () => BuildProvider;
    this.consumePlatformioIDETerminal = TerminalConsumer;
    this.consumeBusy = BusyConsumer;
    this.consumeToolbar = ToolbarConsumer;
    this.consumeDebugger = DebuggerConsumer;

    // misc
    this._reinstallIDETimer = null;
  }

  activate() {
    window.addEventListener('error', maintenance.handleUncaughtErrors);
    maintenance.updateOSEnviron();
    this.startInstaller()
      .then(() => maybeAuthModal())
      .then(() => this.setupCommands())
      .then(() => donateCommand(true))
      .then(() => synchronizeRecentProjects(atom.project.getPaths()))
      .then(() => openPIOHome())
      .then(() => checkIDEUpdates());
  }

  async startInstaller() {
    const im = new InstallationManager();
    if (im.locked()) {
      atom.notifications.addInfo('PlatformIO IDE installation has been suspended.', {
        detail: 'Seems like PlatformIO IDE Installer is already started in another window.',
        dismissable: true
      });
    } else if (await im.check()) {
      return Promise.resolve();
    } else {
      im.lock();
      try {
        await im.install();
      } catch (err) {
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
            detail: 'Make sure that an opened project you are trying to rebuid is ' +
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


    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.advanced.useDevelopmentIDE', (event) => {
        if (this._reinstallIDETimer) {
          clearInterval(this._reinstallIDETimer);
        }
        this._reinstallIDETimer = setTimeout(() => reinstallIDE(event.newValue), 3000);
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.useBuiltinPIOCore', () => {
        reinstallPIOCore();
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.advanced.useDevelopmentPIOCore', () => {
        reinstallPIOCore();
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.advanced.customPATH', (event) => {
        maintenance.handleCustomPATH(event.newValue, event.oldValue);
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.advanced.showPlatformIOFiles', () => {
        maintenance.handleShowPlatformIOFiles();
      })
    );
    maintenance.handleShowPlatformIOFiles();

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.autoCloseSerialMonitor', () => {
        utils.runAtomCommand('build:refresh-targets');
      })
    );

    for (const target of ['build', 'upload', 'program', 'clean', 'test', 'debug']) {
      this.subscriptions.add(atom.commands.add(
        'atom-workspace',
        `platformio-ide:target:${target}`,
        makeRunTargetCommand(target)
      ));
    }

    function makeRunTargetCommand(target) {
      return function() {
        const p = getActivePioProject();
        if (!p) {
          atom.notifications.addWarning('Can not find active PlatformIO project.', {
            detail: 'Make sure that an opened project you are trying to rebuid is ' +
              'a PlatformIO project (e.g., contains `platformio.ini`).'
          });
          return;
        }

        const status = utils.runAtomCommand(`platformio-ide:target:${target}-${p}`);
        if (!status) {
          atom.notifications.addError(`PlatformIO: Failed to run a command: ${target}`, {
            detail: 'Please make sure that "build" package is installed and activated.',
          });
        }
      };
    }

    this.subscriptions.add(atom.workspace.addOpener(uri => {
      if (uri.startsWith('platformio://home')) {
        return new HomeIndex(uri);
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
      synchronizeRecentProjects(projectPaths);
      utils.runAtomCommand('tree-view:show');
      init.ensureProjectsInited(projectPaths);
      init.handleLibChanges(projectPaths);
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
    init.cleanMiscCache();  // @FIXME
    utils.cleanMiscCache(); // @FIXME
    window.removeEventListener('error', maintenance.handleUncaughtErrors);
  }

}

const pioide = new PlatformIOIDEPackage();
export default pioide;
