/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import InformationPage from './containers/information';
import PasswordPage from './containers/password';
import TokenPage from './containers/token';


const routes = [
  {
    path: '/account',
    icon: 'info',
    label: 'Information',
    component: InformationPage
  },
  {
    path: '/account/password',
    icon: 'shield',
    label: 'Password',
    component: PasswordPage
  },
  {
    path: '/account/token',
    icon: 'key',
    label: 'Token',
    component: TokenPage
  },
];

export default routes;
