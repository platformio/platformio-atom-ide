/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as ActionTypes from './actions';

import { combineReducers } from 'redux';
import { copyWithoutMatchingKeys } from './helpers';


function entities(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_ENTITY:
      return Object.assign({}, state, {
        [action.key]: action.data
      });

    case ActionTypes.DELETE_ENTITY:
      return copyWithoutMatchingKeys(state, action.re);

    case ActionTypes.RESET_STORE:
      return {};
  }
  return state;
}

function inputValues(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_INPUT_VALUE:
      return Object.assign({}, state, {
        [action.key]: action.value
      });

    case ActionTypes.RESET_STORE:
      return {};
  }
  return state;
}

function flags(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_FLAG_VALUE:
      return Object.assign({}, state, {
        [action.key]: action.value
      });

    case ActionTypes.RESET_STORE:
      return {};
  }
  return state;
}

function errors(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_ERROR:
      return {
        ...state,
        [action.key]: action.value,
      };

    case ActionTypes.DELETE_ERROR:
      return copyWithoutMatchingKeys(state, action.re);

    case ActionTypes.RESET_STORE:
      return {};
  }
  return state;
}

const rootReducer = combineReducers({
  entities,
  errors,
  flags,
  inputValues
});

export default rootReducer;
