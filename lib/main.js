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
import {installCommands, openTerminal, updateOSEnviron, onActivate, checkClang} from './maintenance';
import {PlatformIOBuildProvider} from './build-provider';
import {runAtomCommand} from './utils';
import {command as initializeNewProject} from './init/command';
import {command as serialMonitor} from './serial-monitor/command';
import {AboutView} from './about/view';

const config = {
  useBuiltinPlatformIO: {
    title: 'Use built-in PlatformIO',
    description: 'This package contains the latest stable PlatformIO CLI tool ' +
                 'which is used by default. Uncheck this option to use own ' +
                 'version of installed PlatformIO (it should be located in the ' +
                 'system `PATH`).',
    type: 'boolean',
    default: true,
    order: 1
  }
};

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

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'platformio-ide:initializeNewProject': () => initializeNewProject(),

      'platformio-ide:maintenance.openTerminal': () => openTerminal('platformio --help'),
      'platformio-ide:maintenance.serialMonitor': () => serialMonitor(),
      'platformio-ide:maintenance.serialPorts': () => openTerminal('platformio serialports list'),

      'platformio-ide:maintenance.installCommands': () => installCommands(),
      'platformio-ide:maintenance.updatePlatformIO': () => openTerminal('platformio update'),
      'platformio-ide:maintenance.upgradePlatformIO': () => openTerminal('platformio upgrade'),

      'platformio-ide:help.docs':
        () => shell.openExternal('http://docs.platformio.org/'),
      'platformio-ide:help.faq':
        () => shell.openExternal('http://docs.platformio.org/en/latest/faq.html'),
      'platformio-ide:help.reportPlatformIOIssue':
        () => shell.openExternal('https://github.com/platformio/platformio/issues'),
      'platformio-ide:help.reportPlatformIOIDEIssue':
        () => shell.openExternal('https://github.com/platformio/platformio-atom-ide/issues'),
      'platformio-ide:help.liveChat':
        () => shell.openExternal('https://gitter.im/platformio/platformio'),

      'platformio-ide:help.twitter':
        () => shell.openExternal('https://twitter.com/PlatformIO_Org'),
      'platformio-ide:help.facebook':
        () => shell.openExternal('https://www.facebook.com/platformio'),

      'platformio-ide:help.website':
        () => shell.openExternal('http://platformio.org/'),
      'platformio-ide:help.about':
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

    onActivate();
  },

  destroy: function() {
    this.subscriptions.dispose();
  },
};
