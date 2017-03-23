/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import path from 'path';


export default class ProjectsBlock extends React.Component {

  static propTypes = {
    items: React.PropTypes.arrayOf(React.PropTypes.string),
    filterValue: React.PropTypes.string.isRequired,
    setFilter: React.PropTypes.func.isRequired,
    openProject: React.PropTypes.func.isRequired,
    removeProject: React.PropTypes.func.isRequired
  }

  render() {
    const items = this.props.items || [];
    return (
      <atom-panel>
        <div className='native-key-bindings' tabIndex='-1'>
          <input type='search'
            className='input-search'
            placeholder='Filter projects'
            defaultValue={ this.props.filterValue }
            onChange={ (e) => this.props.setFilter(e.target.value) } />
        </div>
        { !items.length &&
          <ul className='background-message text-center'>
            <li>
              No results
            </li>
          </ul> }
        <div className='select-list'>
          <ol className='list-group'>
            { items.map(item => (
                <ProjectItem item={ item } onOpen={ this.props.openProject } onRemove={ this.props.removeProject } />
              )) }
          </ol>
        </div>
      </atom-panel>
    );
  }

}

class ProjectItem extends React.Component {

  static propTypes = {
    item: React.PropTypes.object.isRequired,
    onOpen: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired
  }

  componentDidMount() {
    this.disposable = atom.tooltips.add(
      this.refs.removeItem, {
        title: 'Remove project from history'
      }
    );
  }

  onRemoveHandler(event) {
    event.stopPropagation();
    this.props.onRemove(this.props.item);
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
        onClick={ () => this.props.onOpen(this.props.item) }
        onMouseOver={ ::this.onMouseOverHandler }
        onMouseOut={ ::this.onMouseOutHandler }>
        <div ref='removeItem' className='status icon' onClick={ ::this.onRemoveHandler }></div>
        <div className='primary-line icon icon-file-directory'>
          { path.basename(this.props.item) }
        </div>
        <div className='secondary-line no-icon'>
          { this.props.item }
        </div>
      </li>
    );
  }

  componentWillUnmount() {
    if (this.disposable) {
      this.disposable.dispose();
    }
  }
}
