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

import shell from 'shell';
import {CompositeDisposable} from 'atom';
import path from 'path';

import config from './config';
import {installCommands, openTerminal, updateOSEnviron, onActivate, checkClang, setBuildPanelVisibility} from './maintenance';
import {PlatformIOBuildProvider} from './build-provider';
import {runAtomCommand} from './utils';
import {command as initializeNewProject, rebuildIndex} from './init/command';
import {reinstallPlatformIO} from './install/command';
import {command as serialMonitor} from './serial-monitor/command';
import {AboutView} from './about/view';

module.exports = {
  config: config,
  subscriptions: null,

  provideBuilder: function() {
    return PlatformIOBuildProvider;
  },

  activate: function(state) {
    this.subscriptions = new CompositeDisposable();

    // Refresh build targets on useBuiltinPlatformIO change
    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.useBuiltinPlatformIO', (event) => {
        runAtomCommand('build:refresh-targets');
        updateOSEnviron();
      })
    );

    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.useDevelopPlatformIO', (event) => {
        reinstallPlatformIO(event.newValue);
      })
    );

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'platformio-ide:initialize-new-project': () => initializeNewProject(),

      'platformio-ide:maintenance.libmanager-cli': () => openTerminal('pio lib --help'),
      'platformio-ide:maintenance.libmanager-gui': () => shell.openExternal('https://github.com/platformio/platformio-atom-ide/issues/8'),

      'platformio-ide:maintenance.serial-monitor': () => serialMonitor(),
      'platformio-ide:maintenance.serial-ports': () => openTerminal('pio serialports list'),

      'platformio-ide:maintenance.open-terminal': () => openTerminal('pio --help'),

      'platformio-ide:maintenance.rebuild-index': () => rebuildIndex(),
      'platformio-ide:maintenance.install-commands': () => installCommands(),
      'platformio-ide:maintenance.update-platformio': () => openTerminal('pio update'),
      'platformio-ide:maintenance.upgrade-platformio': () => openTerminal('pio upgrade'),

      'platformio-ide:maintenance.bpv-toggle': () => setBuildPanelVisibility('Toggle'),
      'platformio-ide:maintenance.bpv-keep-visible': () => setBuildPanelVisibility('Keep Visible'),
      'platformio-ide:maintenance.bpv-show-on-error': () => setBuildPanelVisibility('Show on Error'),
      'platformio-ide:maintenance.bpv-hidden': () => setBuildPanelVisibility('Hidden'),

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
    }));

    this.subscriptions.add(atom.workspace.addOpener((uriToOpen) => {
      if ('platformio://about' === uriToOpen) {
        return new AboutView(uriToOpen);
      }
    }));

    // Handle *.ino and *.pde files as C++
    atom.workspace.observeTextEditors((editor) => {
      var extname = path.extname(editor.getPath());
      if (['.ino', '.pde'].indexOf(extname) !== -1 ) {
        editor.setGrammar(atom.grammars.grammarForScopeName('source.cpp'));
      }
      if (['.ino', '.pde', '.c', '.cpp', '.h'].indexOf(extname) !== -1) {
        checkClang();
      }
    });

    // Refresh build targets on platformio.ini change
    atom.workspace.observeTextEditors((editor) => {
      if ('platformio.ini' === path.basename(editor.getPath())) {
        editor.onDidSave(() => runAtomCommand('build:refresh-targets'));
      }
    });

    onActivate();
  },

  deactivate: function() {
    this.subscriptions.dispose();
    this.toolBar.removeItems();
  },

  consumeToolBar: function(toolBar) {
    this.toolBar = toolBar('platformio-ide');

    this.toolBar.addButton({
      icon: 'check',
      callback: 'build:trigger',
      tooltip: 'PlatformIO: Build'
    });

    this.toolBar.addButton({
      icon: 'arrow-right',
      callback: 'build:trigger:PlatformIO: Upload',
      tooltip: 'PlatformIO: Upload'
    });

    this.toolBar.addButton({
      icon: 'trashcan',
      callback: 'build:trigger:PlatformIO: Clean',
      tooltip: 'PlatformIO: Clean'
    });

    this.toolBar.addButton({
      icon: 'unfold',
      callback: 'build:toggle-panel',
      tooltip: 'Toggle build panel'
    });

    this.toolBar.addSpacer();

    this.toolBar.addButton({
      icon: 'file-code',
      callback: 'application:new-file',
      tooltip: 'New File'
    });

    this.toolBar.addButton({
      icon: 'file-directory',
      callback: 'application:add-project-folder',
      tooltip: 'Add Project Folder...'
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
