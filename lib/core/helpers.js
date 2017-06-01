/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Telemetry from '../telemetry';


export function goTo(history, path, state) {
  if (history.length) {
    const lastEntry = history.entries[history.index];
    if (lastEntry.pathname === path && JSON.stringify(lastEntry.state) === JSON.stringify(state)) {
      return history.replace(path, state);
    }
  }
  history.push(path, state);
  Telemetry.hitScreenView(path);
}

export function copyWithoutMatchingKeys(obj, re) {
  const newObj = Object.assign({}, obj);
  Object.keys(newObj).forEach(key => {
    if (re.test(key)) {
      delete newObj[key];
    }
  });
  return newObj;
}
