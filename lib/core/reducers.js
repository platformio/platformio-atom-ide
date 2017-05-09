/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as ActionTypes from './actions';

import { combineReducers } from 'redux';


function entities(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_ENTITY:
      return Object.assign({}, state, {
        [action.key]: action.data
      });

    case ActionTypes.DELETE_ENTITY: {
      const newState = Object.assign({}, state);
      Object.keys(newState).forEach(key => {
        if (action.re.test(key)) {
          delete newState[key];
        }
      });
      return newState;
    }

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

const rootReducer = combineReducers({
  entities,
  inputValues
});

export default rootReducer;
