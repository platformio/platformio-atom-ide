/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import BaseModal from '../../core/base-modal';
import PropTypes from 'prop-types';
import React from 'react';


export default class PlatformInstallAdvancedModal extends BaseModal {

  get component() {
    return ModalComponent;
  }

}

class ModalComponent extends React.Component {

  static propTypes = {
    onResolve: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired
  }

  onDidSubmit() {
    const value = this.searchInput.value.trim();
    if (!value) {
      this.focus();
      return;
    }
    this.props.onResolve(value);
  }

  onDidCancel() {
    this.props.onReject(null);
  }

  focus() {
    this.searchInput.focus();
  }

  render() {
    return (
      <div>
        <h1>Advanced platform installation</h1>
        <form onSubmit={ ::this.onDidSubmit } className='block'>
          <input type='search'
            ref={ item => this.searchInput = item }
            className='input-search'
            placeholder='Platform name, repository, requirements...'
            autoFocus />
        </form>

        <ul className='block'>
          <li><kbd>&lt;name&gt;</kbd> - Foo</li>
          <li><kbd>&lt;name&gt;@&lt;version&gt;</kbd> - Foo@1.2.3 or Foo@~1.2.3</li>
          <li><kbd>&lt;name&gt;@&lt;version range&gt;</kbd>  - Foo@!=1.2.0</li>
          <li><kbd>&lt;zip or tarball url&gt;</kbd></li>
          <li><kbd>file://&lt;zip or tarball file&gt;</kbd></li>
          <li><kbd>file://&lt;folder&gt;</kbd></li>
          <li><kbd>&lt;repository&gt;</kbd></li>
          <li><kbd>&lt;name&gt;=&lt;repository&gt;</kbd> (name it should have locally)</li>
          <li><kbd>&lt;repository#tag&gt;</kbd> (&quot;tag&quot; can be commit, branch or tag)</li>
          <li><a href='http://docs.platformio.org/page/userguide/platforms/cmd_install.html'>more (docs)...</a></li>
        </ul>

        <div className="block inset-panel padded">
          Project can depend on a specific version of development platform, please use <kbd>platform = name@x.y.z</kbd> option for <b>platformio.ini</b> in this case. <a href='http://docs.platformio.org/page/projectconf.html#platform'>More details...</a>
        </div>

        <div className='block text-right'>
          <button onClick={ ::this.onDidCancel } className='inline-block btn btn-lg'>Cancel</button>
          <button onClick={ ::this.onDidSubmit } className='inline-block btn btn-lg btn-primary'>Install</button>
        </div>
      </div>
    );
  }

}
