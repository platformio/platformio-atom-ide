/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


export function openPIOHome(force = false) {
  if (force || atom.config.get('platformio-ide.showPIOHome')) {
    atom.workspace.open('platformio://home');
  }
}

export function getActiveRoute(routes, location) {
  for (const route of routes.slice(0).reverse()) {
    if (!route.label || (route.exact && route.path !== location.pathname)) {
      continue;
    }
    if (!location.pathname.startsWith(route.path)) {
      continue;
    }
    return route;
  }
  return null;
}
