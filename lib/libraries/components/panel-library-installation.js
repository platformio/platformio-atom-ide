/** @babel */
/** @jsx etchDom */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import { BasePanel } from '../../view';
import { TextEditor } from 'atom';
import { dom as etchDom } from 'etch';
import relativeDate from 'relative-date';

export default class LibLibraryInstallationPanel extends BasePanel {

  onDidPanelShow() {
    const editor = this.refs.installationEditor;
    editor.setGrammar(
      atom.grammars.grammarForScopeName('source.ini'));
    editor.setText(this.generatePIOProjectConf());
  }

  onDidVersionInstall(event, version) {
    event.target.classList.add('btn-inprogress', 'disabled');
    this.props.homebus.emit(
      'lib-install', [
        `${this.props.data.id}@${version}`,
        () => event.target.classList.remove('btn-inprogress', 'disabled')
      ]);
  }

  getVersionName() {
    if (!this.props.data || !this.props.data.version) {
      return null;
    }
    if (this.props.data.version && this.props.data.version.name) {
      return this.props.data.version.name;
    }
    return this.props.data.version;
  }

  generatePIOProjectConf() {
    if (!this.props.data) {
      return 'Loading...';
    }
    const versionName = this.getVersionName();

    let content = `; PlatformIO Project Configuration File
;
;   Build options: build flags, source filter
;   Upload options: custom upload port, speed and extra flags
;   Library options: dependencies, extra library storages
;   Advanced options: extra scripting
;
; Please visit documentation for the other options and examples
; http://docs.platformio.org/page/projectconf.html

[env:my_build_env]`;

    if (this.props.data.platforms && this.props.data.platforms.length) {
      content += `
platform = ${this.props.data.platforms[0].name}`;
    }
    if (this.props.data.frameworks && this.props.data.frameworks.length) {
      content += `
framework = ${this.props.data.frameworks[0].name}`;
    }

    content += `

lib_deps =
  # Using a library name
  ${this.props.data.name}
    `;

    if (this.props.data.id) {
      content += `
  # ... or using library Id
  ${this.props.data.id}
      `;
    }

    if (!versionName) {
      return content;
    }

    content += `
  # ... or depend on a specific version
  ${this.props.data.name}@${versionName}
    `;

    if (versionName.includes('.')) {
      content += `
  # Semantic Versioning Rules
  # http://docs.platformio.org/page/userguide/lib/cmd_install.html#description
  ${this.props.data.name}@^${versionName}
  ${this.props.data.name}@~${versionName}
  ${this.props.data.name}@>=${versionName}`;
    }
    return content;
  }

  renderManualBlock() {
    if (!this.props.data || !this.props.data.versions) {
      return (<span></span>);
    }
    return (
      <div>
        <h2 className='section-heading icon icon-cloud-download'>Manual</h2>
        <ul className='list-inline'>
          <li>
            <strong>Version</strong>
          </li>
          <li>
            <select ref='versionSelect' className='input-select'>
              { (this.props.data && this.props.data.versions ? this.props.data.versions : []).slice().reverse().map(item => (
                  <option value={ item.name }>
                    { `${item.name} released ${relativeDate(new Date(item.released))}` }
                  </option>
                )) }
            </select>
          </li>
          <li>
            <button onclick={ (e) => this.onDidVersionInstall(e, this.refs.versionSelect.value) } className='btn btn-primary icon icon-cloud-download'>
              Install
            </button>
          </li>
        </ul>
        <br />
      </div>
    );
  }

  render() {
    return (
      <div className='lib-installation'>
        { this.renderManualBlock() }
        <h2 className='section-heading icon icon-file-code'>Project Dependencies <small>platformio.ini</small></h2>
        <div className="inset-panel padded">
          <p>
            <span className='icon icon-info'></span> PlatformIO Core has built-in powerful <a href='http://docs.platformio.org/page/librarymanager/index.html'>Library Manager</a>      that allows you to specify dependencies for specific project in <a href='http://docs.platformio.org/page/projectconf.html'>Project Configuration File "platformio.ini"</a>      using <kbd>lib_deps</kbd> option.
          </p>
          The dependent libraries will be installed automatically on the first build of a project.   No need to install them manually.
        </div>
        <br />
        <TextEditor ref='installationEditor' />
      </div>
    );
  }

}
