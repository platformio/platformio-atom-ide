/** @babel */
/** @jsx etchDom */

/**
 * Copyright (C) 2016 Ivan Kravets. All rights reserved.
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

import { CompositeDisposable, TextEditor } from 'atom';
import { getRecentProjects, removeRecentProject } from '../util';

import EtchComponent from '../../etch-component';
import { dom as etchDom } from 'etch';
import { notifyError } from '../../utils';
import path from 'path';

export default class RecentProjectsView extends EtchComponent {

  constructor(props) {
    props['items'] = [];
    super(props);

    this.disposables = new CompositeDisposable();
    this.disposables.add(this.refs.filterEditor.onDidChange(this.onFilterHandler.bind(this)));
    this.onFilterTimeoutId = null;

    // load recent projects from DB
    this.updateItems();
  }

  updateItems() {
    getRecentProjects(this.refs.filterEditor.getText()).toArray()
      .then((items) => this.update({items: items}))
      .catch((error) => notifyError('RecentProjectsView::updateItems', error));
  }

  onOpenHandler(item) {
    atom.project.addPath(item.path);
  }

  onRemoveHandler(item) {
    removeRecentProject(item)
      .then(() => this.updateItems())
      .catch((error) => notifyError('RecentProjectsView::onRemoveHandler', error));
  }

  onFilterHandler() {
    if (this.onFilterTimeoutId) {
      clearTimeout(this.onFilterTimeoutId);
      this.onFilterTimeoutId = null;
    }
    this.onFilterTimeoutId = setTimeout(() =>
      this.updateItems(), 200);
  }

  render() {
    if (this.props.items.length === 0) {
      return (
        <atom-panel>
          <TextEditor ref='filterEditor' mini={true} placeholderText='Filter projects' />
          <ul className='background-message text-center'>
            <li>No recent projects</li>
          </ul>
        </atom-panel>
      );
    }

    return (
      <atom-panel>
        <TextEditor ref='filterEditor' mini={true} placeholderText='Filter projects' />
        <div className='select-list'>
          <ol className='list-group'>
            {this.props.items.map((item) =>
            <RecentProjectView
              item={item}
              onopen={() => this.onOpenHandler(item)}
              onremove={() => this.onRemoveHandler(item)} />
            )}
          </ol>
        </div>
      </atom-panel>
    );
  }

  destroy() {
    this.disposables.dispose();
    super.destroy();
  }
}

// eslint-disable-next-line no-unused-vars
class RecentProjectView extends EtchComponent {

  constructor(props) {
    super(props);
    this.disposable = atom.tooltips.add(
      this.refs[this.props.item.path],
      {title: 'Remove project from history'}
    );
  }

  onRemoveHandler(event) {
    event.stopPropagation();
    this.props.onremove();
  }

  onMouseOverHandler(event) {
    event.stopPropagation();
    const element = this.refs[this.props.item.path];
    element.classList.add('icon-remove-close');
  }

  onMouseOutHandler(event) {
    event.stopPropagation();
    const element = this.refs[this.props.item.path];
    element.classList.remove('icon-remove-close');
  }

  render() {
    return (
        <li className='two-lines' onclick={this.props.onopen} onmouseover={(e) => this.onMouseOverHandler(e)} onmouseout={(e) => this.onMouseOutHandler(e)}>
        <div ref={this.props.item.path} className='status icon' onclick={(e) => this.onRemoveHandler(e)}></div>
        <div className='primary-line icon icon-file-directory'>{path.basename(this.props.item.path)}</div>
        <div className='secondary-line no-icon'>{this.props.item.path}</div>
      </li>
    );
  }

  destroy() {
    if (this.disposable) {
      this.disposable.dispose();
    }
    super.destroy();
  }
}
