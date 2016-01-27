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
import ini from 'ini';
import {clone} from './utils';

export class PlatformIOBuildProvider {
  constructor(cwd) {
    this.cwd = cwd;
    this.platformioIniPath = path.join(this.cwd, 'platformio.ini');
    this.title = 'PlatformIO';
    this.targetNamePrefix = this.title + ': ';

    this.targetsBaseSettings = [
      {
        name: 'Build',
        args: ['run'],
        keymap: 'ctrl-alt-b',
      },
      {
        name: 'Clean',
        args: ['run', '--target', 'clean'],
        keymap: 'ctrl-alt-c',
      },
      {
        name: 'Upload',
        args: ['run', '--target', 'upload'],
        keymap: 'ctrl-alt-u',
      },
      {
        name: 'Upload using Programmer',
        args: ['run', '--target', 'program'],
      },
      {
        name: 'Upload SPIFFS image',
        args: ['run', '--target', 'uploadfs'],
      }
    ];
  }

  getNiceName() {
    return this.title;
  }

  isEligible() {
    return fs.statSyncNoException(this.platformioIniPath);
  }

  settings() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.platformioIniPath, (err, data) => {
        if (err) reject(err);

        let envs = [];
        const envNamePrefix = 'env:';
        const configSections = Object.keys(ini.parse(data.toString()));
        for (let section of configSections) {
          if (section.indexOf(envNamePrefix) === 0) {
            envs.push(section.slice(envNamePrefix.length));
          }
        }

        let settings = this.prepareSettings(this.targetsBaseSettings);

        if (envs.length > 1) {
          for (let env of envs) {
            let envSettings = this.prepareSettings(this.targetsBaseSettings).map((base) => {
              let item = clone(base);
              item.name += ` (env:${env})`;
              item.args.push('--environment');
              item.args.push(env);
              delete item.keymap;
              return item;
            });
            settings = settings.concat(envSettings);
          }
        }
        resolve(settings);
      });
    });
  }

  prepareSettings(baseSettings) {
    return baseSettings.map(base => {
      let item = clone(base);
      item.name = this.targetNamePrefix + item.name;
      item.exec = "platformio";
      item.sh = false;
      item.env = process.env;
      item.env.PLATFORMIO_FORCE_COLOR = "true";
      item.errorMatch = [
        "^(?<file>src[\\/0-9a-zA-Z\\._\\\\]+):(?<line>\\d+):(?<col>\\d+)"
      ];
      return item;
    });
  }
}
