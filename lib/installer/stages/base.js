/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export default class BaseStage {

  static STATUS_CHECKING = 0;
  static STATUS_INSTALLING = 1;
  static STATUS_SUCCESSED = 2;
  static STATUS_FAILED = 3;

  static STORAGE_STATE_KEY = 'platformio-ide:installer-state';

  constructor(eventbus, params = {}) {
    this.eventbus = eventbus;
    this.params = params;
    this._status = BaseStage.STATUS_CHECKING;
  }

  get name() {
    return 'Stage';
  }

  get status() {
    return this._status;
  }

  set status(status) {
    this._status = status;
    this.eventbus.emit('status-changed');
  }

  get stateKey() {
    return this.constructor.name;
  }

  _commonState() {
    const value = localStorage.getItem(BaseStage.STORAGE_STATE_KEY);
    if (!value) {
      return {};
    }
    try {
      return JSON.parse(value);
    } catch (err) {
      console.error(err);
    }
    return {};
  }

  get state() {
    const data = this._commonState();
    if (data && data.hasOwnProperty(this.stateKey)) {
      return data[this.stateKey];
    }
    return null;
  }

  set state(value) {
    const data = this._commonState();
    data[this.stateKey] = value;
    localStorage.setItem(BaseStage.STORAGE_STATE_KEY, JSON.stringify(data));
  }

  check() {
    throw new Error('Stage must implement a `check` method');
  }

  install() {
    throw new Error('Stage must implement an `install` method');
  }

  destroy() {}

}
