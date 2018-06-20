/** @babel */

/**
 * Copyright (c) 2017-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export default class StateStorage {

  constructor(stateKey) {
    this.stateKey = stateKey;
  }

  _loadState() {
    const value = localStorage.getItem(this.stateKey);
    if (!value) {
      return {};
    }
    try {
      return JSON.parse(value);
    } catch (err) {
      console.warn(err);
    }
    return {};
  }

  getValue(key) {
    const data = this._loadState();
    if (data && data.hasOwnProperty(key)) {
      return data[key];
    }
    return null;
  }

  setValue(key, value) {
    const data = this._loadState();
    data[key] = value;
    localStorage.setItem(this.stateKey, JSON.stringify(data));
  }

}
