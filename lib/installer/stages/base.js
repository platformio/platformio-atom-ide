/** @babel */

/**
 * Copyright 2016-present Ivan Kravets <me@ikravets.com>
 *
 * This source file is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
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
