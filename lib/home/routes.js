/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AboutPage from './containers/about-page';
import BoardsPage from '../platform/containers/boards-page';
import LibraryIndex from '../library/index';
import PlatformPage from '../platform/index';
import WelcomePage from './containers/welcome-page';


const routes = [
  {
    path: '/',
    icon: 'home',
    label: 'Welcome',
    component: WelcomePage
  },
  {
    path: '/lib',
    icon: 'code',
    label: 'Libraries',
    component: LibraryIndex
  },
  {
    path: '/boards',
    icon: 'circuit-board',
    label: 'Boards',
    component: BoardsPage
  },
  {
    path: '/platform',
    icon: 'device-desktop',
    label: 'Platforms',
    component: PlatformPage
  },
  {
    path: '/about',
    component: AboutPage
  }
];



export default routes;
