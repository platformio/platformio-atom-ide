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
import {installCommands, makeSurePlatformioInstalled} from './maintenance';
import {PlatformioBuildProvider} from './build-provider';
import {runAtomCommand} from './utils';
import {command as initializeNewProject} from './init/command';

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
      atom.config.onDidChange('platformio-atom.useBuiltinPlatformio', () => {
        runAtomCommand('build:refresh-targets');
      })
    );

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'platformio-atom:installCommands': () => installCommands(),
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'platformio-atom:initializeNewProject': () => initializeNewProject(),
    }));

    makeSurePlatformioInstalled();
  },

  destroy: function() {
    this.subscriptions.dispose();
  },
};
