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

import * as pioNodeHelpers from 'platformio-node-helpers';

import { BaseView, jsxDOM } from '../view';
import { notifyError } from '../utils';


export default class HomeView extends BaseView {

  constructor(props) {
    super(props);
    this.startServer();
  }

  async startServer() {
    try {
      const params = await pioNodeHelpers.home.ensureServerStarted({
        onIDECommand: (command, params) => {
          if (command === 'open_project') {
            atom.project.addPath(params);
          }
          else if (command === 'open_text_document') {
            atom.workspace.open(params.path, {
              initialLine: (params.line || 1) - 1,
              initialColumn: (params.column || 1) -1
            });
          }
        }
      });
      this.update({ server: params });
    } catch (err) {
      notifyError('Start PIO Home Server', err);
    }
  }

  getURI() {
    return this.props.uri;
  }

  getTitle() {
    return 'PlatformIO Home';
  }

  getIconName() {
    return 'home';
  }

  serialize() {
  }

  destroy() {
    return super.destroy();
  }

  render() {
    const start = this.props.uri.replace('platformio-home:/', '');
    const theme = atom.themes.getActiveThemeNames().some(name => name.toLowerCase().includes('light-ui')) ? 'light' : 'dark';
    return (
      <html>
      <body style={ `margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: ${theme === 'light'? '#FFF' : '#282C34'}` }>
        { this.props.server ? (
          <iframe src={ pioNodeHelpers.home.getFrontendUri(this.props.server.host, this.props.server.port, { start, theme}) }
            width='100%'
            height='100%'
            frameborder='0'
            className='native-key-bindings'
            tabIndex='-1'
            style='border: 0; left: 0; right: 0; bottom: 0; top: 0; position:absolute;' />
          ) : (
          <ul className='background-message centered'>
            <li>
              <span className='loading loading-spinner-medium inline-block'></span>
            </li>
          </ul>
          ) }
      </body>
      </html>
      );
  }
}
