/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import FrameworkDetailPage from './containers/framework-page';
import FrameworksPage from './containers/frameworks-page';
import PlatformDesktopPage from './containers/desktop-page';
import PlatformDetailPage from './containers/platform-page';
import PlatformEmbeddedPage from './containers/embedded-page';
import PlatformInstalledPage from './containers/installed-page';
import PlatformUpdatesPage from './containers/updates-page';


const routes = [
  {
    path: '/platform',
    icon: 'circuit-board',
    label: 'Embedded',
    component: PlatformEmbeddedPage
  },
  {
    path: '/platform/desktop',
    icon: 'device-desktop',
    label: 'Desktop',
    component: PlatformDesktopPage
  },
  {
    path: '/platform/frameworks',
    icon: 'gear',
    label: 'Frameworks',
    component: FrameworksPage
  },
  {
    path: '/platform/frameworks/show',
    component: FrameworkDetailPage
  },
  {
    path: '/platform/installed',
    icon: 'package',
    label: 'Installed',
    component: PlatformInstalledPage
  },
  {
    path: '/platform/updates',
    icon: 'cloud-download',
    label: 'Updates',
    component: PlatformUpdatesPage
  },
  {
    path: '/platform/embedded/show',
    component: PlatformDetailPage
  },
  {
    path: '/platform/desktop/show',
    component: PlatformDetailPage
  },
  {
    path: '/platform/installed/show',
    component: PlatformDetailPage
  }
];

export default routes;
