/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import BaseModal from '../core/base-modal';
import BaseStage from './stages/base';
import PropTypes from 'prop-types';
import React from 'react';


export default class InstallerProgressModal extends BaseModal {

  get component() {
    return ModalComponent;
  }

}

class ModalComponent extends React.Component {

  static propTypes = {
    stages: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  getStatusClass(status) {
    const classes = ['status', 'icon'];
    switch (status) {

      case BaseStage.STATUS_INSTALLING:
        classes.push('status-modified');
        classes.push('icon-desktop-download');
        classes.push('icon-inprogress');
        break;

      case BaseStage.STATUS_SUCCESSED:
        classes.push('status-added');
        classes.push('icon-check');
        break;

      case BaseStage.STATUS_FAILED:
        classes.push('status-removed');
        classes.push('icon-alert');
        break;

      default:
        classes.push('status-ignored');
        classes.push('icon-clock');
        break;

    }
    return classes.join(' ');
  }

  render() {
    return (
      <div>
        <h1>PlatformIO IDE: Installing...</h1>
        <p>
          Please be patient and let the installation complete.
        </p>
        <div className='select-list'>
          <ol className='list-group'>
            { this.props.stages.map(stage => (
                <li key={ stage.name }>
                  <div className={ this.getStatusClass(stage.status) }></div>
                  <div className='icon icon-chevron-right'>
                    { stage.name }
                  </div>
                </li>
              )) }
          </ol>
        </div>
      </div>
    );
  }

}
