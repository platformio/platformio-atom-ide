/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { CompositeDisposable } from 'atom';
import React from 'react';
import ReactDOM from 'react-dom';


export default class BaseModal {

  constructor(props) {
    this.props = props || {};

    this._promise = new Promise((resolve, reject) => {
      this._onResolve = resolve;
      this._onReject = reject;
    });
    this._panel = null;
    this._element = document.createElement('div');
    this._element.classList.add('pio-modal');
    this._element.classList.add('pio-native-key-bindings-tab-fix');

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'core:cancel': () => this.reject(null)
    }));
  }

  get component() {
    throw new Error('Modal must implement a `get component` method');
  }

  open() {
    if (!this._panel) {
      this.renderComponent();
      this._panel = atom.workspace.addModalPanel({
        item: this._element
      });
    }
    this.onDidOpen();
    return this._promise;
  }

  renderComponent() {
    ReactDOM.render(
      <this.component { ...this.props } onResolve={ ::this.resolve } onReject={ ::this.reject } />,
      this._element
    );
  }

  setProps(newProps) {
    this.props = newProps;
    this.renderComponent();
  }

  resolve(value) {
    this._onResolve(value);
    this.destroy();
  }

  reject(reason) {
    this._onReject(reason);
    this.destroy();
  }

  onDidOpen() {}

  destroy() {
    this.subscriptions.dispose();
    this._promise = null;
    if (this._panel) {
      this._panel.destroy();
    }
    ReactDOM.unmountComponentAtNode(this._element);
  }

}
