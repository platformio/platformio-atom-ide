/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import BaseModal from '../../core/base-modal';
import PropTypes from 'prop-types';
import React from 'react';


export default class LibraryInstallAdvancedModal extends BaseModal {

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
        <h1>Advanced library installation</h1>
        <form onSubmit={ ::this.onDidSubmit } className='block'>
          <input type='search'
            ref={ item => this.searchInput = item }
            className='input-search'
            placeholder='Library id, name, repository, requirements...'
            autoFocus />
        </form>

        <ul className='block'>
          <li><kbd>&lt;id&gt;</kbd> - 12345</li>
          <li><kbd>id=&lt;id&gt;</kbd> - id=12345</li>
          <li><kbd>&lt;id&gt;@&lt;version&gt;</kbd> - 12345@1.2.3 or 12345@^1.2.3 (<a href='http://semver.org/'>Semantic Versioning</a>)</li>
          <li><kbd>&lt;id&gt;@&lt;version range&gt;</kbd> - 12345@&gt;0.1.0,!=0.2.0,&lt;0.3.0</li>
          <li><kbd>&lt;name&gt;</kbd> - Foo</li>
          <li><kbd>&lt;name&gt;@&lt;version&gt;</kbd> - Foo@1.2.3 or Foo@~1.2.3</li>
          <li><kbd>&lt;name&gt;@&lt;version range&gt;</kbd>  - Foo@!=1.2.0</li>
          <li><kbd>&lt;zip or tarball url&gt;</kbd></li>
          <li><kbd>file://&lt;zip or tarball file&gt;</kbd></li>
          <li><kbd>file://&lt;folder&gt;</kbd></li>
          <li><kbd>&lt;repository&gt;</kbd></li>
          <li><kbd>&lt;name&gt;=&lt;repository&gt;</kbd> (name it should have locally)</li>
          <li><kbd>&lt;repository#tag&gt;</kbd> (&quot;tag&quot; can be commit, branch or tag)</li>
          <li><a href='http://docs.platformio.org/page/userguide/lib/cmd_install.html'>more (docs)...</a></li>
        </ul>

        <div className="block inset-panel padded">
          <p>
            <span className='icon icon-info'></span> PlatformIO Core has built-in powerful <a href='http://docs.platformio.org/page/librarymanager/index.html'>Library Manager</a>      that allows you to specify dependencies for specific project in <a href='http://docs.platformio.org/page/projectconf.html'>Project Configuration File &quot;platformio.ini&quot;</a>      using <kbd>lib_deps</kbd> option.
          </p>
          The dependent libraries will be installed automatically on the first build of a project.   No need to install them manually.
        </div>

        <div className='block text-right'>
          <button onClick={ ::this.onDidCancel } className='inline-block btn btn-lg'>Cancel</button>
          <button onClick={ ::this.onDidSubmit } className='inline-block btn btn-lg btn-primary'>Install to...</button>
        </div>
      </div>
    );
  }

}
