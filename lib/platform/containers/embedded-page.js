/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { EMBEDDED_INPUT_FILTER_KEY, getEmbeddedFilter, getVisibleEmbeddedPlatforms } from '../selectors';

import { INPUT_FILTER_DELAY } from '../../config';
import PlatformInstallAdvancedModal from './install-advanced-modal';
import PlatformsList from '../components/platforms-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../core/actions';


class PlatformEmbeddedPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadRegistryPlatforms: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    installPlatform: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadRegistryPlatforms();
  }

  async onDidAdvanced(event) {
    event.stopPropagation();
    const button = event.target;
    button.classList.add('btn-inprogress', 'disabled');
    try {
      this.props.installPlatform(
        await (new PlatformInstallAdvancedModal().open()),
        () => button.classList.remove('btn-inprogress', 'disabled')
      );
    } catch (err) {
      if (err) {
        console.error(err);
      }
      button.classList.remove('btn-inprogress', 'disabled');
    }
  }

  render() {
    return (
      <div>
        <div className='block row'>
          <div className='col-xs-9'>
            <span className='icon icon-question'></span> Please read more how to <a href='http://docs.platformio.org/page/platforms/creating_platform.html'>create a custom development platform</a>.
          </div>
          <div className='col-xs-3 text-right'>
            <button onClick={ (e) => this.onDidAdvanced(e) } className='btn btn-primary icon icon-cloud-download inline-block-tight'>
              Advanced
            </button>
          </div>
        </div>
        <PlatformsList { ...this.props } actions={ ['install'] } />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: getVisibleEmbeddedPlatforms(state),
    filterValue: getEmbeddedFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platform/embedded/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platform/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    setFilter: value => dispatch(lazyUpdateInputValue(EMBEDDED_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, stateProps, dispatchProps);
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PlatformEmbeddedPage);
