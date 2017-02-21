'use babel';

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

export default class ContentCache {

  static instance = null;
  static tdmap = {
    's': 1,
    'm': 60,
    'h': 3600,
    'd': 86400
  };

  constructor() {
    // singleton
    if (ContentCache.instance) {
      return ContentCache.instance;
    }
    ContentCache.instance = this;    
    this._storage = new Map();
    setInterval(() => this._cleanOutdated(), 3600 * 1000);
    return ContentCache.instance;
  }

  _cleanOutdated() {
    const now = new Date().getTime();
    for (const [key, value] of this._storage.entries()) {
      if (value.expire < now) {
        this.delete(key);
      }
    }
  }

  static keyFromArgs(...args) {
    return args.join();
  }

  get(key, default_ = null) {
    if (!this._storage.has(key)) {
      return default_;
    }
    const item = this._storage.get(key);
    if (item.expire < new Date().getTime()) {
      return default_;
    }
    return item.data;
  }

  set(key, data, valid) {
    let expire = parseInt(valid.slice(0, -1));
    expire *= ContentCache.tdmap[valid.slice(-1)];
    expire *= 1000; // ms
    expire += new Date().getTime();
    this._storage.set(key, {
      data,
      expire
    });
  }

  delete(key) {
    if (this._storage.has(key)) {
      this._storage.delete(key);
    }
  }

}
