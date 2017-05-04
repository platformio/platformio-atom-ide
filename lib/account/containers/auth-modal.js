/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { AuthComponent } from '../components/auth-component';
import BaseModal from '../../base-modal';

export default class AuthModal extends BaseModal {

  get component() {
    return AuthComponent;
  }

}
