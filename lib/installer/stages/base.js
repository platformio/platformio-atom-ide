/** @babel */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

export default class BaseStage {

  static STATUS_CHECKING = 0;
  static STATUS_INSTALLING = 1;
  static STATUS_SUCCESSED = 2;
  static STATUS_FAILED = 3;

  constructor(eventbus) {
    this.eventbus = eventbus;
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

  check() {
    throw new Error('Stage must implement a `check` method');
  }

  install() {
    throw new Error('Stage must implement an `install` method');
  }

  destroy() {}

}
