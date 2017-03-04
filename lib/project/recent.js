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

import { BaseView, FilteredList, jsxDOM } from '../view';
import { CompositeDisposable, TextEditor } from 'atom';
import { getRecentProjects, removeRecentProject, synchronizeRecentProjects } from './util';

import fuzzaldrin from 'fuzzaldrin-plus';
import path from 'path';


export default class RecentProjects extends BaseView {

  constructor() {
    synchronizeRecentProjects(atom.project.getPaths());
    super(...arguments);
    this.disposables = new CompositeDisposable();
    this.disposables.add(atom.project.onDidChangePaths((projectPaths) => {
      synchronizeRecentProjects(projectPaths);
      this.update();
    }));
  }

  render() {
    return (
      <div>
        <RecentProjectsView items={ getRecentProjects() } />
      </div>
    );
  }

  destroy() {
    this.disposables.dispose();
    return super.destroy();
  }

}

class RecentProjectsView extends FilteredList {

  get filterEditor() {
    return this.refs.filterEditor;
  }

  onDidFilter() {
    this.update();
  }

  getItems() {
    if (!this.props.hasOwnProperty('items')) {
      return [];
    }
    if (!this.refs) {
      return this.props.items;
    }
    const query = this.filterEditor.getText();
    return query ? fuzzaldrin.filter(this.props.items, query) : this.props.items;
  }

  onDidRemove(item) {
    removeRecentProject(item);
    this.props.items = this.props.items.filter(_item => _item !== item);
    this.update();
  }

  onDidSelect(item) {
    atom.project.addPath(item);
  }

  render() {
    const items = this.getItems();
    return (
      <atom-panel>
        <TextEditor ref='filterEditor' mini={ true } placeholderText='Filter projects' />
        {!items.length ? (
          <ul className='background-message text-center'>
            <li>
              No recent projects
            </li>
          </ul>
        ) : ('')}
        <div className='select-list'>
          <ol className='list-group'>
            { items.map((item) => (
                <RecentProjectItem item={ item } onselect={ () => this.onDidSelect(item) } onremove={ () => this.onDidRemove(item) } />
              )) }
          </ol>
        </div>
      </atom-panel>
    );
  }

}

class RecentProjectItem extends BaseView {

  constructor(props) {
    super(props);
    this.disposable = atom.tooltips.add(
      this.refs.removeItem, {
        title: 'Remove project from history'
      }
    );
  }

  onRemoveHandler(event) {
    event.stopPropagation();
    this.props.onremove();
  }

  onMouseOverHandler(event) {
    event.stopPropagation();
    const element = this.refs.removeItem;
    element.classList.add('icon-remove-close');
  }

  onMouseOutHandler(event) {
    event.stopPropagation();
    const element = this.refs.removeItem;
    element.classList.remove('icon-remove-close');
  }

  render() {
    return (
      <li className='two-lines'
        onclick={ this.props.onselect }
        onmouseover={ (e) => this.onMouseOverHandler(e) }
        onmouseout={ (e) => this.onMouseOutHandler(e) }>
        <div ref='removeItem' className='status icon' onclick={ (e) => this.onRemoveHandler(e) }></div>
        <div className='primary-line icon icon-file-directory'>
          { path.basename(this.props.item) }
        </div>
        <div className='secondary-line no-icon'>
          { this.props.item }
        </div>
      </li>
    );
  }

  destroy() {
    this.disposable.dispose();
    super.destroy();
  }
}
