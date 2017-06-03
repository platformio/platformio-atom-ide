/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
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

export function getFlagValue(state, key) {
  const data = state.flags || {};
  if (!data.hasOwnProperty(key)) {
    return null;
  }
  return data[key];
}

export function getError(state, key) {
  const data = state.errors || {};
  if (!data.hasOwnProperty(key)) {
    return null;
  }
  return data[key];
}
