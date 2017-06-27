/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';

import BaseStage from './base';


export default class CodeCompletionEngineStage extends BaseStage {

  get name() {
    return 'Intelligent Code Completion';
  }

  async check() {
    if ([-1, 1].includes(this.state)) {
      this.status = BaseStage.STATUS_SUCCESSED;
      return true;
    }
    const clang_found = await new Promise(resolve => {
      utils.runCommand('clang', ['--version'], code => resolve(code === 0));
    });

    if (clang_found) {
      this.state = 1;
      this.status = BaseStage.STATUS_SUCCESSED;
      return true;
    }

    console.warn('Clang is not installed in your system');

    const selected = atom.confirm({
      message: 'Clang is not installed in your system!',
      detailedMessage: 'PlatformIO IDE uses "Clang" for the Intelligent Code Completion.\n' +
        'Please install it, otherwise this feature will be disabled.',
      buttons: ['Install Clang', 'Remind Later', 'Disable Code Completion']
    });
    switch (selected) {
      case 0:
        utils.openUrl('http://docs.platformio.org/page/ide/atom.html#clang-for-intelligent-code-completion');
        throw new Error('Clang is not installed in your system');

      case 2:
        this.state = -1;
        break;
    }
    return true;
  }

  install() {
    return true;
  }

}
