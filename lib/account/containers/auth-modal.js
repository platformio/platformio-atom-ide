/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AuthContainer from '../containers/auth-container';
import BaseModal from '../../core/base-modal';


export default class AuthModal extends BaseModal {

  get component() {
    return AuthContainer;
  }

}
