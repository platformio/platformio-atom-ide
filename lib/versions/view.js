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
import request from 'request';
import child_process from 'child_process';
import {getIDEVersion, getPythonExecutable, runAtomCommand} from '../utils';

export class VersionsView {

  constructor() {
    // Parse template and retrieve its root element
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'template.html'), {encoding: 'utf-8'});
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.pio-template-root').cloneNode(true);

    this.wrapper = this.element.querySelector('.version-wrapper');
    this.copy = this.element.querySelector('.version-copy');

    this.copy.onclick = () => {
      const versions = this.wrapper.textContent.trim().replace(/\s+/g, ' ');
      atom.clipboard.write(versions);
    };
    this.copyTooltip = atom.tooltips.add(this.copy, {title: 'Copy versions'});

    Promise.all([this.retrieveIDEVersion(), this.retrieveCLIVersion()])
      .then(::this.checkPlatformIOVersion);
  }

  retrieveIDEVersion() {
    const version = getIDEVersion();
    this.setVersion(version, '.ide-version');
    return version;
  }

  retrieveCLIVersion() {
    return new Promise((resolve, reject) => {
      const onError = () => {
        this.setVersion('Failed to retrieve', '.cli-version');
        reject();
      };
      let stdout = '';
      const result = child_process.spawn('platformio', ['--version']);
      result.on('error', onError);
      result.stdout.on('data', (chunk) => stdout += chunk);
      result.on('close', (code) => {
        if (0 !== code) {
          onError();
        } else {
          const version = stdout.trim().match(/[\d+\.]+.*$/)[0];
          this.setVersion(version, '.cli-version');
          resolve(version);
        }
      });
    });
  }

  checkPlatformIOVersion([ideVersion, cliVersion]) {
    const options = {
      url: 'https://pypi.python.org/pypi/platformio/json',
      headers: {
        'User-Agent': `PlatformIOIDE/${ideVersion}`
      }
    };

    request(options, (err, response, body) => {
      if (err) {
        console.warn(err);
      } else if (response.statusCode != 200) {
        console.warn(`PyPI returned HTTP status code ${response.statusCode}`);
      } else {
        const latestVersion = JSON.parse(body).info.version;
        let stdout = '';
        const args = ['-c', `from pkg_resources import parse_version; print parse_version('${cliVersion}') < parse_version('${latestVersion}')`];
        const child = child_process.spawn(getPythonExecutable(), args);
        child.on('error', onError);
        child.stdout.on('data', (chunk) => stdout += chunk);
        child.on('close', (code) => {
          if (0 !== code) {
            onError();
          } else if (stdout.startsWith('True')) {
            const wrapper = this.element.querySelector('.upgrade-wrapper');
            wrapper.querySelector('.new-version').textContent = latestVersion;
            wrapper.querySelector('.do-upgrade').onclick = function() {
              runAtomCommand('platformio-ide:maintenance.upgrade-platformio');
            };
            wrapper.style.display = 'block';
          }
        });
      }

      function onError() {
        console.warn('Failed to determine if upgrade is available');
      }
    });
  }

  setVersion(string, parentClass) {
    const element = this.element.querySelector(parentClass +' .version-string');
    element.textContent = string;
  }

  getElement() {
    return this.element;
  }

  destroy() {
    this.copyTooltip.dispose();
    this.element.remove();
  }
}
