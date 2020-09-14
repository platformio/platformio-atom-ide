/** @babel */

/**
 * Copyright (c) 2017-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from '../config';
import * as utils from '../utils';

import fs from 'fs-plus';
import path from 'path';


export default class PythonPrompt {

  STATUS_TRY_AGAIN = 0;
  STATUS_ABORT = 1;
  STATUS_CUSTOMEXE = 2;

  async prompt() {
    const selectedItem = atom.confirm({
      message: 'PlatformIO: Can not find Python 3.5+ Interpreter',
      detailedMessage: 'PlatformIO Core is written in Python and depends on it. ' +
        'Please install Python 3.5+ or ' +
        'if you have it, please choose a directory where "python3/python.exe" program is located.',
      buttons: [
        'Install Python 3',
        'I have Python 3',
        'Try again',
        'Abort PlatformIO IDE Installation'
      ]
    });

    switch (selectedItem) {
      case 0:
        utils.openUrl('http://docs.platformio.org/page/faq.html#install-python-interpreter');
        return { status: this.STATUS_TRY_AGAIN };

      case 1:
        for (const d in (await this.chooseCustomPythonDirs() || [])) {
          const pythonExecutable = path.join(d, config.IS_WINDOWS ? 'python.exe' : 'python3');
          if (fs.isFileSync(pythonExecutable)) {
            return {
              status: this.STATUS_CUSTOMEXE,
              pythonExecutable
            };
          }
        }
        return { status: this.STATUS_TRY_AGAIN };

      case 3:
        return { status: this.STATUS_ABORT };

      default:
        return { status: this.STATUS_TRY_AGAIN };
    }
  }

  chooseCustomPythonDirs() {
    return new Promise((resolve) => {
      atom.pickFolder(paths => {
        resolve(paths);
      });
    });
  }
}
