/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { getIsLoggedIn, getToken } from '../selectors';

import PropTypes from 'prop-types';
import React from 'react';
import Token from '../components/token';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteEntity } from '../../core/actions';


class TokenPage extends React.Component {

  static propTypes = {
    token: PropTypes.string,
    isLoggedIn: PropTypes.bool.isRequired,
    deleteToken: PropTypes.func.isRequired,
  }

  constructor() {
    super(...arguments);

    this.tokenPlaceholder = '•'.repeat(40);

    this.onCopyClick = ::this.onCopyClick;
  }

  onCopyClick() {
    if (this.props.token) {
      atom.clipboard.write(this.props.token);
      atom.notifications.addSuccess('Token has been copied to clipboard.');
    }
  }

  componentWillUnmount() {
    this.props.deleteToken();
  }

  render() {
    return (
      <div className='token-page'>
        <Token {...this.props}
          token={ this.props.token || this.tokenPlaceholder }
          onCopyClick={ this.onCopyClick }
          isCopyDisabled={ this.props.token == this.tolenPlaceholder } />
      </div>);
  }

}

function mapStateToProps(state) {
  return {
    token: getToken(state),
    isLoggedIn: getIsLoggedIn(state),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...actions,
    deleteToken: () => deleteEntity(/^token/),
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TokenPage);
