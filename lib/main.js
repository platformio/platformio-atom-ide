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

import {CompositeDisposable} from 'atom';
import path from 'path';
import shell from 'shell';

import config from './config';
import * as maintenance from './maintenance';
import {PlatformIOBuildProvider} from './build-provider';
import {runAtomCommand, getActiveProjectPath} from './utils';
import {command as initializeNewProject, rebuildIndex} from './init/command';
import {command as importArduinoIDEProject} from './import-arduino-project/command';
import {command as installPlatformIO} from './install/command';
import {reinstallPlatformIO} from './install/command';
import {command as serialMonitor} from './serial-monitor/command';
import {command as donateCommand} from './donate/command';
import {AboutView} from './about/view';
import {consumeRunInTerminal} from './terminal';

module.exports = {
  config: config,
  subscriptions: null,

  consumeRunInTerminal: consumeRunInTerminal,

  provideBuilder: function() {
    return PlatformIOBuildProvider;
  },

  activate: function() {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'platformio-ide:initialize-new-project': () => initializeNewProject(),
      'platformio-ide:import-arduino-ide-project': () => importArduinoIDEProject(),

      'platformio-ide:maintenance.libmanager-cli': () => maintenance.openTerminal('pio lib --help'),
      'platformio-ide:maintenance.libmanager-gui': () => shell.openExternal('https://github.com/platformio/platformio-atom-ide/issues/8'),

      'platformio-ide:maintenance.serial-monitor': () => serialMonitor(),
      'platformio-ide:maintenance.serial-ports': () => maintenance.openTerminal('pio serialports list'),

      'platformio-ide:maintenance.open-terminal': () => maintenance.openTerminal('pio --help'),

      'platformio-ide:maintenance.rebuild-index': () => rebuildIndex(getActiveProjectPath()),
      'platformio-ide:maintenance.install-commands': () => maintenance.installCommands(),
      'platformio-ide:maintenance.update-platformio': () => maintenance.openTerminal('pio update'),
      'platformio-ide:maintenance.upgrade-platformio': () => maintenance.openTerminal('pio upgrade'),

      'platformio-ide:maintenance.bpv-toggle': () => maintenance.setBuildPanelVisibility('Toggle'),
      'platformio-ide:maintenance.bpv-keep-visible': () => maintenance.setBuildPanelVisibility('Keep Visible'),
      'platformio-ide:maintenance.bpv-show-on-error': () => maintenance.setBuildPanelVisibility('Show on Error'),
      'platformio-ide:maintenance.bpv-hidden': () => maintenance.setBuildPanelVisibility('Hidden'),

      'platformio-ide:help-docs':
        () => shell.openExternal('http://docs.platformio.org/'),
      'platformio-ide:help-faq':
        () => shell.openExternal('http://docs.platformio.org/en/latest/faq.html'),
      'platformio-ide:help.report-platformio-issue':
        () => shell.openExternal('https://github.com/platformio/platformio/issues'),
      'platformio-ide:help.report-platformio-ide-issue':
        () => shell.openExternal('https://github.com/platformio/platformio-atom-ide/issues'),
      'platformio-ide:help.live-chat':
        () => shell.openExternal('https://gitter.im/platformio/platformio'),

      'platformio-ide:help-twitter':
        () => shell.openExternal('https://twitter.com/PlatformIO_Org'),
      'platformio-ide:help-facebook':
        () => shell.openExternal('https://www.facebook.com/platformio'),

      'platformio-ide:help-website':
        () => shell.openExternal('http://platformio.org/'),
      'platformio-ide:help-about':
        () => atom.workspace.open('platformio://about'),
      'platformio-ide:donate': () => donateCommand(),
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

    for (let target of ['Build', 'Upload', 'Clean']) {
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
          atom.notifications.addError('PlaftormIO: Project does not have opened directories', {
            detail: 'Please open a directory with your PlatformIO project first.'
          });
          return;
        }

        const status = runAtomCommand(`platformio-ide:target:${target.toLowerCase()}-${p}`);
        if (!status) {
          atom.notifications.addError(`PlaftormIO: Failed to run a command: ${target}`);
        }
      };
    }

    this.subscriptions.add(atom.workspace.addOpener((uriToOpen) => {
      if ('platformio://about' === uriToOpen) {
        return new AboutView(uriToOpen);
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
      maintenance.ensureProjectsInited(projectPaths);
    }));

    maintenance.updateOSEnviron();
    installPlatformIO()
      .then(maintenance.checkIfPlatformIOCanBeExecuted)
      .then(() => donateCommand(true));
  },

  deactivate: function() {
    this.subscriptions.dispose();
    this.toolBar.removeItems();
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
      tooltip: 'Initialize new PlatformIO Project or update existing...'
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
      callback: 'platformio-ide:maintenance.libmanager-cli',
      tooltip: 'Library Manager'
    });

    this.toolBar.addButton({
      icon: 'plug',
      callback: 'platformio-ide:maintenance.serial-ports',
      tooltip: 'Serial Ports'
    });

    this.toolBar.addButton({
      icon: 'browser',
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
