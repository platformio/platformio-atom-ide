/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as config from '../../config';
import * as utils from '../../utils';

import BaseStage from './base';
import path from 'path';


export default class CodeCompletionEngineStage extends BaseStage {

  get name() {
    return 'Intelligent Code Completion';
  }

  async check() {
    if ([-1, 1].includes(this.state)) {
      this.status = BaseStage.STATUS_SUCCESSED;
      return true;
    }

    let clang_installed = await this.clangInstalled();
    if (!clang_installed && config.IS_WINDOWS) {
      process.env.PATH = [
        'C:\\Program Files\\LLVM\\bin',
        'C:\\Program Files (x86)\\LLVM',
        process.env.PATH
      ].join(path.delimiter);
      if (process.env.Path) {
        process.env.Path = process.env.PATH;
      }
      clang_installed = await this.clangInstalled();
    }

    if (clang_installed) {
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

  async clangInstalled() {
    return new Promise(resolve => {
      utils.runCommand('clang', ['--version'], code => resolve(code === 0));
    });
  }

  install() {
    return true;
  }

}
