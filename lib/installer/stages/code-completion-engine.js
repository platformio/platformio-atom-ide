/** @babel */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as utils from '../../utils';

import BaseStage from './base';

export default class CodeCompletionEngineStage extends BaseStage {

  static CLANG_CHECKED_KEY = 'platformio-ide:clang-checked';

  get name() {
    return 'Intelligent Code Completion';
  }

  get checkedState() {
    return localStorage.getItem(CodeCompletionEngineStage.CLANG_CHECKED_KEY);
  }

  set checkedState(value) {
    localStorage.setItem(CodeCompletionEngineStage.CLANG_CHECKED_KEY, value);
  }

  check() {
    if (['-1', '1'].includes(this.checkedState)) {
      this.status = BaseStage.STATUS_SUCCESSED;
      return true;
    }
    return new Promise((resolve, reject) => {
      utils.runCommand('clang', ['--version'], code => {
        if (code === 0) {
          this.checkedState = '1';
          this.status = BaseStage.STATUS_SUCCESSED;
          return resolve(true);
        }
        reject('Clang is not installed in your system');
      });
    });
  }

  install() {
    if (this.checkedState === '1') {
      return true;
    }
    const selected = atom.confirm({
      message: 'Clang is not installed in your system!',
      detailedMessage: 'PlatformIO IDE uses "Clang" for the Intelligent Code Completion.\n' +
        'Please install it, otherwise this feature will be disabled.',
      buttons: ['Install Clang', 'Remind Later', 'Disable Code Completion']
    });
    switch (selected) {
      case 0:
        utils.openUrl('http://docs.platformio.org/page/ide/atom.html#clang-for-intelligent-code-completion');
        break;
      case 2:
        this.checkedState === '-1';
        break;
    }
    return true;
  }

}
