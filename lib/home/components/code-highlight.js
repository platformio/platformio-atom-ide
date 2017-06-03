/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';

import { PKG_BASE_DIR } from '../../config';
import PropTypes from 'prop-types';
import React from 'react';
import fs from 'fs-plus';
import hljs from 'highlight.js';
import path from 'path';


export default class CodeHighlight extends React.Component {

  static propTypes = {
    lang: PropTypes.string,
    url: PropTypes.string,
    content: PropTypes.string
  }

  componentDidMount() {
    this.linkStyle();
    this.handleContent(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.handleContent(newProps);
  }

  async componentDidUpdate() {
    if (this.codeElement) {
      hljs.highlightBlock(this.codeElement);
    }
  }

  getStylePath() {
    const isLight = atom.themes.getActiveThemeNames().find(name => name.includes('light'));
    return path.join(
      PKG_BASE_DIR, 'node_modules', 'highlight.js', 'styles',
      `atom-one-${isLight ? 'light' : 'dark'}.css`
    );
  }

  linkStyle() {
    const styleId = 'hljs-stylesheet';
    if (document.querySelector(`#${styleId}`)) {
      return;
    }
    const styleNode = document.createElement('link');
    styleNode.setAttribute('id', styleId);
    styleNode.setAttribute('rel', 'stylesheet');
    styleNode.setAttribute('type', 'text/css');
    styleNode.setAttribute('href', this.getStylePath());
    const mainNode = document.querySelector('.home-app .main-container');
    mainNode.insertBefore(styleNode, mainNode.firstChild);
  }

  async handleContent(props) {
    if (props.content) {
      this.setState({
        content: props.content
      });
    } else if (props.url) {
      // reset previous content after 2secs if a new one has not been received yet
      let loadingTimer = null;
      if (this.state && this.state.content) {
        loadingTimer = setTimeout(() => this.setState({ content: null }), 2000);
      }

      try {
        this.setState({
          content: await this.loadSourceContent(props.url)
        });
        if (loadingTimer) {
          clearInterval(loadingTimer);
        }
      } catch (err) {
        utils.notifyError(`Could not load source file "${props.url}". Please try later.`, err);
        return;
      }
    }
  }

  loadSourceContent(url) {
    return new Promise((resolve, reject) => {
      if (url.startsWith('http')) {
        utils.processHTTPRequest(
          {
            url,
            cacheValid: '15m'
          },
          (err, response, body) => {
            if (err || response.statusCode !== 200) {
              return reject(err);
            }
            resolve(body);
          }
        );
      } else {
        fs.readFile(url, 'utf8', function(err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      }
    });
  }

  render() {
    const content = this.state && this.state.content ? this.state.content : 'Loading...';
    return (
      <pre><code ref={ code => this.codeElement = code } className={ this.props.lang }>{ content }</code></pre>
    );
  }

}
