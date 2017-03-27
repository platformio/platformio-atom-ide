/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export function getInputValue(state, key) {
  const data = state.inputValues || {};
  if (!data.hasOwnProperty(key)) {
    return null;
  }
  return data[key];
}
