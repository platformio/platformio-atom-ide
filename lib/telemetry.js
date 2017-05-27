/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { getCoreVersion, getIDEVersion } from './utils';

import crypto from 'crypto';
import getmac from 'getmac';
import request from 'request';

export default class Telemetry {

  static defaultParams = {
    v: 1,
    tid: 'UA-1768265-13',
    ua: navigator.userAgent,
    av: getIDEVersion(),
    vp: `${atom.getDefaultWindowDimensions().width}x${atom.getDefaultWindowDimensions().height}`
  }

  static instance = null;

  static hitScreenView(name) {
    return new Telemetry().send('screenview', {
      cd: name
    });
  }

  static hitEvent(category, action, label='') {
    return new Telemetry().send('event', {
      ec: category,
      ea: action,
      el: label
    });
  }

  static hitException(description, fatal=false) {
    if (description instanceof ErrorEvent) {
      description = [
        description.message,
        `${description.filename}:${description.lineno}`
      ];
    }
    return new Telemetry().send('exception', {
      exd: description.toString().substring(0, 2048),
      exf: fatal
    });
  }

  constructor() {
    // singleton
    if (Telemetry.instance) {
      return Telemetry.instance;
    }
    Telemetry.instance = this;
    this._cid = null;
    this._core_version = undefined;
    this._offLine = !navigator.onLine;

    return Telemetry.instance;
  }

  static uuid() {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  async fetchCid() {
    if (this._cid) {
      return this._cid;
    }
    const lsKey = 'platformio-ide:telemetry-cid';
    this._cid = localStorage.getItem(lsKey);
    if (this._cid) {
      return this._cid;
    }

    try {
      this._cid = await new Promise((resolve, reject) => {
        getmac.getMac((err, result) => err ? reject(err) : resolve(crypto.createHash('sha1').update(result, 'utf8').digest('hex')));
      });
      localStorage.setItem(lsKey, this._cid);
    } catch (err) {
      this._cid = Telemetry.uuid();
    }
    return this._cid;
  }

  async fetchCoreVersion() {
    if (this._core_version || this._core_version !== undefined) {
      return this._core_version;
    }
    try {
      this._core_version = await getCoreVersion();
    } catch (err) {
      this._core_version = '';
    }
    return this._core_version;
  }

  async fetchAppName(){
    let name = `IDE/${Telemetry.defaultParams.av}`;
    const core = await this.fetchCoreVersion();
    if (core) {
      name += ` Core/${core}`;
    }
    return name;
  }

  async send(hittype, params) {
    if (this._offLine) {
      return;
    }
    try {
      params = Object.assign({}, Telemetry.defaultParams, params);
      params.t = hittype;
      params.cid = await this.fetchCid();
      params.an = await this.fetchAppName();
      request.post('https://www.google-analytics.com/collect')
        .form(params)
        .on('error', err => {
          console.error(err);
          this._offLine = true;
        });
      return true;
    } catch (err) {
      return false;
    }
  }

}
