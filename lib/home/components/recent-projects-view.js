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

import EtchComponent from '../../etch-component';
import { dom as etchDom } from 'etch';
import path from 'path';

export default class RecentProjectsView extends EtchComponent {

  constructor(props) {
    super(props);

    this.disposables = new CompositeDisposable();
    this.disposables.add(this.refs.filterEditor.onDidChange(this.onFilterHandler.bind(this)));
    this.onFilterTimeoutId = null;
  }

  onFilterHandler() {
    if (this.onFilterTimeoutId) {
      clearTimeout(this.onFilterTimeoutId);
      this.onFilterTimeoutId = null;
    }
    this.onFilterTimeoutId = setTimeout(() => this.update(), 100);
  }

  getItems() {
    if (!this.props.hasOwnProperty('items')) {
      return [];
    }
    const filterQuery = this.refs.filterEditor.getText();
    return this.props.items.filter(
      (project) => filterQuery?
        project.path.indexOf(filterQuery) !== -1 : true);
  }

  render() {
    if (this.getItems().length === 0) {
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
            {this.getItems().map((item) =>
            <RecentProjectItem
              item={item}
              onselect={() => this.props.onselect(item)}
              onremove={() => this.props.onremove(item)} />
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

class RecentProjectItem extends EtchComponent {

  constructor(props) {
    super(props);
    this.disposable = atom.tooltips.add(
      this.refs[this.props.item.path],
      { title: 'Remove project from history' }
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
      <li className='two-lines' onclick={this.props.onselect} onmouseover={(e) => this.onMouseOverHandler(e)} onmouseout={(e) => this.onMouseOutHandler(e)}>
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
