/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import CodeHighlight from '../../home/components/code-highlight';
import PropTypes from 'prop-types';
import React from 'react';
import path from 'path';


export default class LibraryDetailExamples extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired
  }

  componentWillMount() {
    this.setState({
      files: this.props.items.length ? this.props.items[0].files : []
    });
  }

  onDidExampleChange(index) {
    this.setState({
      files: this.props.items[index].files
    });
  }

  render() {
    if (!this.props.items.length) {
      return (
        <ul className='background-message text-center'>
          <li>
            No examples
          </li>
        </ul>
      );
    }
    return (
      <div>
        <div className='block'>
          <select onChange={ (e) => this.onDidExampleChange(e.target.value) } className='input-select'>
            { this.props.items.map((item, index) => (
                <option key={ item.name } value={ index }>
                  { item.name }
                </option>
              )) }
          </select>
        </div>
        <ExampleFiles items={ this.state ? this.state.files : [] } />
      </div>
    );
  }

}

class ExampleFiles extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired
  }

  constructor() {
    super(...arguments);
    this.codePlaceholders = [];
  }

  onDidToggle(event, index) {
    event.target.classList.toggle('icon-fold');
    event.target.classList.toggle('icon-unfold');
    this.codePlaceholders[index].classList.toggle('hide');
  }

  render() {
    return (
      <div>
        { this.props.items.map((item, index) => (
            <div key={ item }>
              <h3>{ path.basename(item) } <span className='pull-right'><a onClick={ (e) => this.onDidToggle(e, index) }><span className='icon icon-fold' title='Show/Hide example'></span></a></span></h3>
              <div ref={ item => this.codePlaceholders.push(item) }><CodeHighlight lang='c' url={ item } /></div>
            </div>
          )) }
      </div>
    );
  }

}
