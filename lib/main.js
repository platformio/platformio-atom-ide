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
import {installCommands} from './maintenance';
import {PlatformioBuildProvider} from './build-provider';
import {runAtomCommand} from './utils';
import {command as initializeNewProject} from './init/command';
import {command as installPlatformio} from './install/command';
import {AboutView} from './about/view';

const config = {
  useBuiltinPlatformio: {
    title: 'Use built-in PlatformIO',
    description: 'This package is shipped with full PlatformIO distribution ' +
                 '(including all dependencies) which is used by default. ' +
                 'Uncheck this option to use own version of installed PlatformIO.',
    type: 'boolean',
    default: true,
    order: 1
  }
};

module.exports = {
  config: config,
  subscriptions: null,

  provideBuilder: function() {
    return PlatformioBuildProvider;
  },

  activate: function(state) {
    this.subscriptions = new CompositeDisposable();

    // Refresh build targets on useBuiltinPlatformio change
    this.subscriptions.add(
      atom.config.onDidChange('platformio-ide.useBuiltinPlatformio', () => {
        runAtomCommand('build:refresh-targets');
      })
    );

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'platformio-ide:installCommands': () => installCommands(),
      'platformio-ide:initializeNewProject': () => initializeNewProject(),

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

    installPlatformio();
  },

  destroy: function() {
    this.subscriptions.dispose();
  },
};
