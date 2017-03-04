'use babel';

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

export default class MemoryCache {

  static instance = null;
  static tdmap = {
    's': 1,
    'm': 60,
    'h': 3600,
    'd': 86400
  };

  constructor() {
    // singleton
    if (MemoryCache.instance) {
      return MemoryCache.instance;
    }
    MemoryCache.instance = this;
    this._storage = new Map();
    setInterval(() => this._cleanOutdated(), 600 * 1000); // every 10min
    return MemoryCache.instance;
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
    expire *= MemoryCache.tdmap[valid.slice(-1)];
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

  clear() {
    this._storage.clear();
  }

}
