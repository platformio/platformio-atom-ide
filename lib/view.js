/** @babel */
/** @jsx etch.dom */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as utils from './utils';

import etch from 'etch';

export class EtchComponent {
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

export class BasePanel extends EtchComponent {

  constructor() {
    super(...arguments);
    this._frozen = false;
    this._wasPanelShown = false;
  }

  onDidPanelShow() {}

  onDidPanelHide() {}

  showPanel() {
    this._wasPanelShown = true;
    this.element.style.setProperty('display', 'block');
    this.onDidPanelShow();
  }

  hidePanel() {
    this.element.style.setProperty('display', 'none');
    this.onDidPanelHide();
  }

  wasPanelShown() {
    return this._wasPanelShown;
  }

  freezePanel() {
    this._frozen = true;
  }

  unfreezePanel() {
    this._frozen = false;
  }

  isFrozenPanel() {
    return this._frozen;
  }

  update() {
    if (this.isFrozenPanel()) {
      return;
    }
    return super.update(...arguments);
  }

}

export class SubPanels extends BasePanel {

  constructor() {
    super(...arguments);
    this._lastSubpanelId = null;
  }

  get lastSubpanelId() {
    return this._lastSubpanelId;
  }

  getSubPanels() {
    throw new Error('SubPanels must implement a `getSubPanels` method');
  }

  getSubmenu() {
    const candidates = new Map();
    let item = null;
    let active = false;
    this.getSubPanels().forEach(panel => {
      if (!panel.submenu) {
        return;
      }
      if (!this._lastSubpanelId && candidates.length === 0) {
        active = true;
      } else {
        active = this._lastSubpanelId && this._lastSubpanelId === panel.id;
      }
      if (!candidates.has(panel.submenu)) {
        item = {
          name: panel.submenu,
          icon: panel.icon,
          panelId: panel.id,
          active: active
        };
      } else {
        item = candidates.get(panel.submenu);
        item.active |= active;
      }
      candidates.set(panel.submenu, item);
    });
    const items = [];
    for (const item of candidates.values()) {
      items.push(item);
    }
    return items;
  }

  showSubPanel(id) {
    this._lastSubpanelId = id;
    this.getSubPanels().forEach((item) => {
      if (item.id === id) {
        this.refs[`${item.id}Panel`].showPanel();
      } else {
        this.refs[`${item.id}Panel`].hidePanel();
      }
    });
  }

}

export class PanelSubmenuView extends EtchComponent {

  getClassListForItem(item) {
    const classList = ['btn', 'icon', `icon-${item.icon}`];
    if (item.active) {
      classList.push('selected');
    }
    return classList;
  }

  render() {
    return (
      <div className='panel-submenu btn-group btn-group-lg'>
        { this.props.items.map(item => (
            <button onclick={ () => this.props.onpanelchanged(item.panelId) } className={ this.getClassListForItem(item).join(' ') }>
              { utils.title(item.name) }
            </button>
          )) }
      </div>
    );
  }

}
