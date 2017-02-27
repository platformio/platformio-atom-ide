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

import { CompositeDisposable, TextEditor } from 'atom';
import { EtchComponent } from '../../view';
import etch from 'etch';

export default class LibRegistrySearchFormView extends EtchComponent {

  constructor() {
    super(...arguments);
    this.disposables = new CompositeDisposable();
    this.disposables.add(atom.commands.add(
      this.refs.libSearchEditor.element,
      'core:confirm',
      () => this.onDidSearch(this.refs.libSearchEditor.getText())
    ));
  }

  onDidSearch(query) {
    this.props.homebus.emit('lib-search', {
      query
    });
  }

  update(props) {
    super.update(props);
    if (props.hasOwnProperty('query')) {
      this.refs.libSearchEditor.setText(props.query);
    }
  }

  destroy() {
    this.disposables.dispose();
    super.destroy();
  }

  render() {
    return (
      <div className='lib-search-from'>
        <TextEditor ref='libSearchEditor' mini={ true } placeholderText='Search libraries' />
        <div className='block search-tips'>
          <button onclick={ () => this.onDidSearch('tft display') } className='btn btn-default btn-xs icon icon-search' title='Search in "library.json" fields'>
            tft display
          </button>
          <button onclick={ () => this.onDidSearch('dht*') } className='btn btn-default btn-xs icon icon-search' title='Search for libraries that support DHT ICs (DHT11, DHT22)'>
            dht*
          </button>
          <button onclick={ () => this.onDidSearch('header:RH_ASK.h') } className='btn btn-default btn-xs icon icon-search' title='Search by header files (#inculde)'>
            header:RH_ASK.h
          </button>
          <button onclick={ () => this.onDidSearch('keyword:mqtt') } className='btn btn-default btn-xs icon icon-search' title='Filter libraries by keyword'>
            keyword:mqtt
          </button>
          <button onclick={ () => this.onDidSearch('framework:mbed') } className='btn btn-default btn-xs icon icon-search' title='ARM mbed based libraries'>
            framework:mbed
          </button>
          <button onclick={ () => this.onDidSearch('platform:espressif8266') } className='btn btn-default btn-xs icon icon-search' title='Search for Espressif 8266 compatible libraries'>
            platform:espressif8266
          </button>
          <a href='http://docs.platformio.org/page/userguide/lib/cmd_search.html'>more...</a>
        </div>
      </div>
    );
  }
}
