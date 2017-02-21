/** @babel */
/** @jsx etchDom */

/**
 * Copyright 2016-present Ivan Kravets <me@ikravets.com>
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
import { EtchComponent } from '../../etch-component';
import { dom as etchDom } from 'etch';

export default class LibInstallAdvancedPrompt {

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._onresolve = resolve;
      this._onreject = reject;
    });

    this.view = new LibInstallAdvancedView({
      onsubmit: () => this.onDidSubmit(),
      oncancel: () => this.onDidCancel()
    });

    this.disposables = new CompositeDisposable();
    this.disposables.add(atom.commands.add(
      this.view.refs.libEditor.element,
      'core:confirm',
      () => this.onDidSubmit()
    ));
    this.disposables.add(atom.commands.add(
      this.view.refs.libEditor.element, 'core:cancel',
      () => this.onDidCancel()
    ));
    this.panel = null;
  }

  onDidSubmit() {
    const lib = this.view.refs.libEditor.getText().trim();
    if (!lib) {
      this.focus();
      return;
    }
    this._onresolve(this.view.refs.libEditor.getText());
    this.destroy();
  }

  onDidCancel() {
    this._onreject();
    this.destroy();
  }

  focus() {
    this.view.refs.libEditor.element.focus();
  }

  prompt() {
    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({
        item: this.view
      });
    }
    this.focus();
    return this.promise;
  }

  async destroy() {
    this.disposables.dispose();
    this.promise = null;
    if (this.panel) {
      this.panel.destroy();
    }
    await this.view.destroy();
  }

}

class LibInstallAdvancedView extends EtchComponent {

  render() {
    return (
      <div>
        <h1>Custom library installation</h1>
        <TextEditor ref='libEditor' mini={ true } placeholderText='Library id, name, repository, requirements...' />

        <ul className='block'>
          <li><kbd>&lt;id&gt;</kbd> - 12345</li>
          <li><kbd>id=&lt;id&gt;</kbd> - id=12345</li>
          <li><kbd>&lt;id&gt;@&lt;version&gt;</kbd> - 12345@1.2.3 or 12345@^1.2.3 (<a href='http://semver.org/'>Semantic Versioning</a>)</li>
          <li><kbd>&lt;id&gt;@&lt;version range&gt;</kbd> - 12345@>0.1.0,!=0.2.0,&lt;0.3.0</li>
          <li><kbd>&lt;name&gt;</kbd> - Foo</li>
          <li><kbd>&lt;name&gt;@&lt;version&gt;</kbd> - Foo@1.2.3 or Foo@~1.2.3</li>
          <li><kbd>&lt;name&gt;@&lt;version range&gt;</kbd>  - Foo@!=1.2.0</li>
          <li><kbd>&lt;zip or tarball url&gt;</kbd></li>
          <li><kbd>file://&lt;zip or tarball file&gt;</kbd></li>
          <li><kbd>file://&lt;folder&gt;</kbd></li>
          <li><kbd>&lt;repository&gt;</kbd></li>
          <li><kbd>&lt;name&gt;=&lt;repository&gt;</kbd> (name it should have locally)</li>
          <li><kbd>&lt;repository#tag&gt;</kbd> ("tag" can be commit, branch or tag)</li>
          <li><a href='http://docs.platformio.org/page/userguide/lib/cmd_install.html'>more (docs)...</a></li>
        </ul>

        <div className="block inset-panel padded">
          <p>
            <span className='icon icon-info'></span> PlatformIO Core has built-in powerful <a href='http://docs.platformio.org/page/librarymanager/index.html'>Library Manager</a>      that allows you to specify dependencies for specific project in <a href='http://docs.platformio.org/page/projectconf.html'>Project Configuration File "platformio.ini"</a>      using <kbd>lib_deps</kbd> option.
          </p>
          The dependent libraries will be installed automatically on the first build of a project.   No need to install them manually.
        </div>


        <div className='block text-right'>
            <button onclick={ this.props.oncancel } className='inline-block btn btn-lg'>Cancel</button>
            <button onclick={ this.props.onsubmit } className='inline-block btn btn-lg btn-primary'>Install to...</button>
        </div>
      </div>
    );
  }

}
