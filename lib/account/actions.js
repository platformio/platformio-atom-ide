/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export const AUTH_FORM_OPEN_REQUEST = 'AUTH_FORM_OPEN_REQUEST';
export const AUTH_FORM_SUCCESS = 'AUTH_FORM_SUCCESS';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const FORGOT_PASSWORD_REQUEST = 'FORGOT_PASSWORD_REQUEST';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const ACCOUNT_INFO_UPDATE_REQUEST = 'ACCOUNT_INFO_UPDATE_REQUEST';
export const ACCOUNT_INFO_UPDATE_COMPLETED = 'ACCOUNT_INFO_UPDATE_COMPLETED';
export const ACCOUNT_LOGIN_STATUS_CHECK_REQUEST = 'ACCOUNT_LOGIN_STATUS_CHECK_REQUEST';
export const TOKEN_FETCH_REQUEST = 'TOKEN_FETCH_REQUEST';
export const TOKEN_FETCH_SUCCESS = 'TOKEN_FETCH_SUCCESS';
export const TOKEN_FETCH_FORM_OPEN_REQUEST = 'TOKEN_FETCH_FORM_OPEN_REQUEST';
export const PASSWORD_CHANGE_REQUEST = 'PASSWORD_CHANGE_REQUEST';

function action(type, payload = {}) {
  return {
    type,
    ...payload,
  };
}

export const authFormOpenRequest = (formType) => action(AUTH_FORM_OPEN_REQUEST, {
  formType,
});
export const authFormSuccess = () => action(AUTH_FORM_SUCCESS);
export const loginRequest = (username, password) => action(LOGIN_REQUEST, {
  username,
  password,
});
export const registerRequest = (username) => action(REGISTER_REQUEST, {
  username,
});
export const forgotPasswordRequest = (username) => action(FORGOT_PASSWORD_REQUEST, {
  username,
});
export const logoutRequest = () => action(LOGOUT_REQUEST);
export const accountInfoUpdateRequest = () => action(ACCOUNT_INFO_UPDATE_REQUEST);
export const accountInfoUpdateCompleted = () => action(ACCOUNT_INFO_UPDATE_COMPLETED);
export const accountLoginStatusCheckRequest = () => action(ACCOUNT_LOGIN_STATUS_CHECK_REQUEST);
export const tokenFetchRequest = (password, regenerate) => action(TOKEN_FETCH_REQUEST, {
  password,
  regenerate,
});
export const tokenFetchSuccess = () => action(TOKEN_FETCH_SUCCESS);
export const tokenFetchFormOpenRequest = (regenerate) => action(TOKEN_FETCH_FORM_OPEN_REQUEST, {
  regenerate,
});
export const passwordChangeRequest = (oldPassword, newPassword) => action(PASSWORD_CHANGE_REQUEST, {
  oldPassword,
  newPassword,
});
