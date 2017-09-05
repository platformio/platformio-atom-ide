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

import etch from 'etch';


export const jsxDOM = etch.dom;

export class BaseModal {

  constructor(props) {
    this._initProps = props;
    this._promise = new Promise((resolve, reject) => {
      this._onresolve = resolve;
      this._onreject = reject;
    });
    this._panel = null;
  }

  get view() {
    throw new Error('Modal must implement a `get view` method');
  }

  setProps(props) {
    this.view.update(props);
  }

  open() {
    if (!this._panel) {
      this._panel = atom.workspace.addModalPanel({
        item: this.view
      });
    }
    this.onDidOpen();
    if (this._initProps) {
      this.setProps(this._initProps);
    }
    return this._promise;
  }

  resolve(value) {
    this._onresolve(value);
    this.destroy();
  }

  reject(reason) {
    this._onreject(reason);
    this.destroy();
  }

  onDidOpen() {}

  destroy() {
    this._promise = null;
    if (this._panel) {
      this._panel.destroy();
    }
    return this.view.destroy();
  }

}

class EtchComponent {
  /* Derived this class from https://github.com/atom/about/blob/master/lib/etch-component.js */

  constructor(props) {
    this.props = props;

    etch.initialize(this);
    EtchComponent.setScheduler(atom.views);
  }

  static getScheduler() {
    return etch.getScheduler();
  }

  static setScheduler(scheduler) {
    etch.setScheduler(scheduler);
  }

  update(props) {
    if (props) {
      const oldProps = this.props;
      this.props = Object.assign({}, oldProps, props);
    }
    return etch.update(this);
  }

  destroy() {
    return etch.destroy(this);
  }

  render() {
    throw new Error('Etch components must implement a `render` method');
  }
}

export class BaseView extends EtchComponent {

}
