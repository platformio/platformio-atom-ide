/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ChangePasswordPage from './containers/change-password';
import ForgotPasswordPage from './containers/forgot-password';
import InformationPage from './containers/information';


const routes = [
  {
    path: '/account',
    icon: 'info',
    label: 'Information',
    component: InformationPage
  },
  {
    path: '/account/change-password',
    icon: 'shield',
    label: 'Change Password',
    component: ChangePasswordPage
  },
  {
    path: '/account/forgot-password',
    icon: 'lock',
    label: 'Forgot Password',
    component: ForgotPasswordPage
  },
];

export default routes;
