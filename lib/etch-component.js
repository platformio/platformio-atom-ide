/** @babel */
/** @jsx etchDom */

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
