/** @babel */

/**
 * Copyright (c) 2017-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as pioNodeHelpers from 'platformio-node-helpers';
import * as utils from '../utils';


export default class PythonPrompt {

  STATUS_TRY_AGAIN = 0;
  STATUS_ABORT = 1;
  STATUS_CUSTOMEXE = 2;

  async prompt() {
    let pythonExecutable = null;
    const selectedItem = atom.confirm({
      message: 'PlatformIO: Can not find Python 2.7 Interpreter',
      detailedMessage: 'PlatformIO Core is written in Python and depends on it. ' +
        'Please install Python 2.7 (PYTHON 3 IS NOT SUPPORTED YET) or ' +
        'if you have it, please choose a directory where "python/python.exe" program is located.',
      buttons: [
        'Install Python 2.7',
        'I have Python 2.7',
        'Try again',
        'Abort PlatformIO IDE Installation'
      ]
    });

    switch (selectedItem) {
      case 0:
        utils.openUrl('http://docs.platformio.org/page/faq.html#install-python-interpreter');
        return { status: this.STATUS_TRY_AGAIN };

      case 1:
        pythonExecutable = await pioNodeHelpers.misc.getPythonExecutable(
          atom.config.get('platformio-ide.useBuiltinPIOCore'),
          await this.chooseCustomPythonDirs()
        );
        if (pythonExecutable) {
          return {
            status: this.STATUS_CUSTOMEXE,
            pythonExecutable
          };
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
