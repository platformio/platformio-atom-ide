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

import { BaseModal, BaseView, jsxDOM } from '../../view';
import { CompositeDisposable, TextEditor } from 'atom';

export default class PlatformInstallAdvancedModal extends BaseModal {

  constructor() {
    super(...arguments);
    this._view = null;
  }

  get view() {
    if (!this._view) {
      this._view =  new PlatformInstallAdvancedView({
        onresolve: (value) => this.resolve(value),
        onreject: (reason) => this.reject(reason)
      });
    }
    return this._view;
  }

  onDidOpen() {
    this.view.focus();
  }

}

class PlatformInstallAdvancedView extends BaseView {

  constructor() {
    super(...arguments);

    this.disposables = new CompositeDisposable();
    this.disposables.add(atom.commands.add(
      this.refs.platformEditor.element,
      'core:confirm',
      ::this.onDidSubmit
    ));
    this.disposables.add(atom.commands.add(
      this.refs.platformEditor.element, 'core:cancel',
      ::this.onDidCancel
    ));
  }

  onDidSubmit() {
    const platform = this.refs.platformEditor.getText().trim();
    if (!platform) {
      this.focus();
      return;
    }
    this.props.onresolve(this.refs.platformEditor.getText().trim());
  }

  onDidCancel() {
    this.props.onreject(null);
  }

  focus() {
    this.refs.platformEditor.element.focus();
  }

  destroy() {
    this.disposables.dispose();
    super.destroy();
  }

  render() {
    return (
      <div>
        <h1>Advanced platform installation</h1>
        <TextEditor ref='platformEditor' mini={ true } placeholderText='Platform name, repository, requirements...' />

        <ul className='block'>
          <li><kbd>&lt;name&gt;</kbd> - Foo</li>
          <li><kbd>&lt;name&gt;@&lt;version&gt;</kbd> - Foo@1.2.3 or Foo@~1.2.3</li>
          <li><kbd>&lt;name&gt;@&lt;version range&gt;</kbd>  - Foo@!=1.2.0</li>
          <li><kbd>&lt;zip or tarball url&gt;</kbd></li>
          <li><kbd>file://&lt;zip or tarball file&gt;</kbd></li>
          <li><kbd>file://&lt;folder&gt;</kbd></li>
          <li><kbd>&lt;repository&gt;</kbd></li>
          <li><kbd>&lt;name&gt;=&lt;repository&gt;</kbd> (name it should have locally)</li>
          <li><kbd>&lt;repository#tag&gt;</kbd> ("tag" can be commit, branch or tag)</li>
          <li><a href='http://docs.platformio.org/page/userguide/platforms/cmd_install.html'>more (docs)...</a></li>
        </ul>

        <div className="block inset-panel padded">
          Project can depend on a specific version of development platform, please use <kbd>platform = name@x.y.z</kbd> option for <b>platformio.ini</b> in this case. <a href='http://docs.platformio.org/page/projectconf.html#platform'>More details...</a>
        </div>

        <div className='block text-right'>
          <button onclick={ ::this.onDidCancel } className='inline-block btn btn-lg'>Cancel</button>
          <button onclick={ ::this.onDidSubmit } className='inline-block btn btn-lg btn-primary'>Install</button>
        </div>
      </div>
    );
  }

}
