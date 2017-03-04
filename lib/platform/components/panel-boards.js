/** @babel */
/** @jsx jsxDOM */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import { BasePanel, jsxDOM } from '../../view';

import BoardsExplorerView from './boards-view';
import { getBoards } from '../util';


export default class BoardsExplorerPanel extends BasePanel {

  onDidPanelShow() {
    if (this.isFrozenPanel()) {
      return;
    }

    getBoards().then(items => {
      this.freezePanel();
      this.refs.boardsExplorer.update({
        items
      });
    });
  }

  render() {
    return (
      <div>
        <BoardsExplorerView homebus={ this.props.homebus } ref='boardsExplorer' />
      </div>
    );
  }

}
