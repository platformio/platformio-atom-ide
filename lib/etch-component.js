/** @babel */
/** @jsx etchDom */

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

export class EtchComponent {
  /* Derived from https://github.com/atom/about/blob/master/lib/etch-component.js */

  constructor (props) {
    this.props = props;

    etch.initialize(this);
    EtchComponent.setScheduler(atom.views);
  }

  static getScheduler() {
    return etch.getScheduler();
  }

  static setScheduler (scheduler) {
    etch.setScheduler(scheduler);
  }

  update(props) {
    const oldProps = this.props;
    this.props = Object.assign({}, oldProps, props);
    return etch.update(this);
  }

  destroy() {
    etch.destroy(this);
  }

  render() {
    throw new Error('Etch components must implement a `render` method');
  }
}

export class BasePanel extends EtchComponent {

  onDidPanelShow() { }

  onDidPanelHide() { }

  showPanel() {
    const forceRender = this.delayedRender && !this.__wasPanelShown;
    this.__wasPanelShown = true;
    if (forceRender) {
      this.update();
    }
    this.element.style.setProperty('display', 'block');
    this.onDidPanelShow();
  }

  hidePanel() {
    this.element.style.setProperty('display', 'none');
    this.onDidPanelHide();
  }

  wasPanelShown() {
    return this.__wasPanelShown;
  }

  set delayedRender(value) {
    this.__delayedRender = value;
  }

  get delayedRender() {
    return this.__delayedRender;
  }

}
