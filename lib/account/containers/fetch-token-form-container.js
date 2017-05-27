/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { FETCH_TOKEN_ERROR_KEY, IS_TOKEN_FETCH_IN_PROGRESS_KEY } from '../selectors';
import { getError, getFlagValue } from '../../core/selectors';

import FetchTokenForm from '../components/fetch-token-form';
import { connect } from 'react-redux';


const FetchTokenFormContainer = connect(mapStateToProps, actions)(FetchTokenForm);

function mapStateToProps(state) {
  return {
    error: getError(state, FETCH_TOKEN_ERROR_KEY),
    isTokenFetchInProgress: getFlagValue(state, IS_TOKEN_FETCH_IN_PROGRESS_KEY),
  };
}

export default FetchTokenFormContainer;
