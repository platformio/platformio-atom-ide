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

import fs from 'fs';
import path from 'path';
import {clone, getPlatformIOExecutable} from './utils';
import {PLATFORMIO_BASE_ARGS} from './constants';

export class PlatformioBuildProvider {
  constructor(cwd) {
    this.cwd = cwd;

    this.title = 'PlatformIO';
    this.targetNamePrefix = this.title + ': ';
    this.targetArgsPrefix = PLATFORMIO_BASE_ARGS;

    this.errorMatch = [
      "^\n(?<file>[\\/0-9a-zA-Z\\._]+):(?<line>\\d+):(?<col>\\d+)"
    ];

    this.targetsBaseSettings = [
      {
        name: 'Run / Build',
        args: ['run'],
      },
      {
        name: 'Clean',
        args: ['run', '--target', 'clean'],
      },
      {
        name: 'Upload',
        args: ['run', '--target', 'upload'],
      },
      {
        name: 'Upload using Programmer',
        args: ['run', '--target', 'program'],
      },
      {
        name: 'Upload SPIFFS image',
        args: ['run', '--target', 'uploadfs'],
      },
      {
        name: 'Update platforms and libraries',
        args: ['update']
      }
    ];
  }

  getNiceName() {
    return this.title;
  }

  isEligible() {
    return fs.statSyncNoException(path.join(this.cwd, 'platformio.ini'));
  }

  settings() {
    const PlatformIOExecutable = getPlatformIOExecutable();

    return this.targetsBaseSettings.map(base => {
      var item = clone(base);
      item.name = this.targetNamePrefix + item.name;
      item.exec = PlatformIOExecutable;
      item.args = this.targetArgsPrefix.concat(item.args);
      item.sh = false;
      return item;
    });
  }
}
