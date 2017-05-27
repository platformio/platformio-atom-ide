/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition */

import * as actions from './actions';
import * as selectors from './selectors';
import * as utils from '../utils';

import { FORGOT_FORM, LOGIN_FORM, REGISTER_FORM } from './containers/auth-container';
import { call, fork, put, select, take, takeEvery } from 'redux-saga/effects';
import { deleteEntity, deleteError, updateEntity, updateError, updateFlagValue, updateInputValue } from '../core/actions';
import { isUsernameValid, runAccountCommand } from './helpers';

import AuthModal from './containers/auth-modal';
import FetchTokenModal from './containers/fetch-token-modal';
import Telemetry from '../telemetry';
import { getIsLoggedIn } from './selectors';


function* watchAuthForm() {
  yield takeEvery(actions.AUTH_FORM_OPEN_REQUEST, function*({formType}) {
    Telemetry.hitScreenView(`/auth/${formType}`);
    try {
      const modal = new AuthModal({
        formType,
      });
      yield fork(::modal.open);
      yield take(actions.AUTH_FORM_SUCCESS);
      yield call(::modal.destroy);
    } catch (error) {
      console.error(error);
    }
  });
}

function* watchLoginRequest() {
  yield takeEvery(actions.LOGIN_REQUEST, function*({username, password}) {
    try {
      if (!isUsernameValid(username)) {
        yield put(updateError(LOGIN_FORM, 'Invalid username'));
        return;
      }
      if (!password) {
        yield put(updateError(LOGIN_FORM, 'Password cannot be empty'));
        return;
      }
      yield put(updateFlagValue(selectors.IS_AUTH_REQUEST_IN_PROGRESS_KEY, true));
      yield put(updateInputValue(selectors.LAST_USED_USERNAME_KEY, username));
      yield call(runAccountCommand, 'login', {
        extraArgs: ['--username', username, '--password', password],
      });
      yield put(updateFlagValue(selectors.IS_LOGGED_IN_KEY, true));
      yield put(actions.authFormSuccess());
      yield put(deleteError(LOGIN_FORM));
      yield put(updateFlagValue(selectors.IS_AUTH_REQUEST_IN_PROGRESS_KEY, false));
      atom.notifications.addSuccess('You have logged in successfully');

      // Immediately request info update, which will in turn update the
      // Information  page in if it's opened.
      yield put(actions.accountInfoUpdateRequest());
    } catch (error) {
      yield put(updateError(LOGIN_FORM, error.message));
      console.error(error);
    } finally {
      yield put(updateFlagValue(selectors.IS_AUTH_REQUEST_IN_PROGRESS_KEY, false));
    }
  });
}

function* watchRegisterRequest() {
  yield takeEvery(actions.REGISTER_REQUEST, function*({username}) {
    try {
      if (!isUsernameValid(username)) {
        yield put(updateError(REGISTER_FORM, 'Invalid username'));
        return;
      }
      yield put(updateFlagValue(selectors.IS_AUTH_REQUEST_IN_PROGRESS_KEY, true));
      yield put(updateInputValue(selectors.LAST_USED_USERNAME_KEY, username));
      yield call(runAccountCommand, 'register', {
        extraArgs: ['--username', username],
      });
      yield put(actions.authFormSuccess());
      yield put(deleteError(REGISTER_FORM));
      atom.notifications.addSuccess('You have been registered successfully', {
        detail: 'Your password was sent to the email address you specified',
      });
    } catch (error) {
      yield put(updateError(REGISTER_FORM, error.message));
      console.error(error);
    } finally {
      yield put(updateFlagValue(selectors.IS_AUTH_REQUEST_IN_PROGRESS_KEY, false));
    }
  });
}

function* watchForgotPasswordRequest() {
  yield takeEvery(actions.FORGOT_PASSWORD_REQUEST, function*({username}) {
    try {
      if (!isUsernameValid(username)) {
        yield put(updateError(FORGOT_FORM, 'Invalid username'));
        return;
      }
      yield put(updateFlagValue(selectors.IS_AUTH_REQUEST_IN_PROGRESS_KEY, true));
      yield put(updateInputValue(selectors.LAST_USED_USERNAME_KEY, username));
      yield call(runAccountCommand, 'forgot', {
        extraArgs: ['--username', username],
      });
      yield put(actions.authFormSuccess());
      yield put(deleteError(FORGOT_FORM));
      atom.notifications.addSuccess('Password reset request has been sent successfully', {
        detail: 'Please check your email for instructions',
      });
    } catch (error) {
      yield put(updateError(FORGOT_FORM, error.message));
      console.error(error);
    } finally {
      yield put(updateFlagValue(selectors.IS_AUTH_REQUEST_IN_PROGRESS_KEY, false));
    }
  });
}

function* watchLogoutRequest() {
  while (true) {
    try {
      yield take(actions.LOGOUT_REQUEST);
      yield call(runAccountCommand, 'logout');
      yield put(updateFlagValue(selectors.IS_LOGGED_IN_KEY, false));
      atom.notifications.addSuccess('Logout Success!');
    } catch (error) {
      if (error.message.includes('not logged in')) {
        yield put(updateFlagValue(selectors.IS_LOGGED_IN_KEY, false));
        atom.notifications.addSuccess('Logout Success!');
      } else {
        utils.notifyError('Logout Failed!', error);
      }
    }
  }
}

function* watchAccountInfoUpdateRequest() {
  while (true) {
    try {
      yield take(actions.ACCOUNT_INFO_UPDATE_REQUEST);
      yield put(deleteEntity(/^accountInformation/));
      const data = yield call(runAccountCommand, 'show', {
        extraArgs: ['--json-output'],
      });
      yield put(updateEntity(selectors.ACCOUNT_INFORMATION_KEY, data));
      if (data && data.username) {
        yield put(updateFlagValue(selectors.IS_LOGGED_IN_KEY, true));
        yield put(updateInputValue(selectors.LAST_USED_USERNAME_KEY, data.username));
      }
    } catch (error) {
      console.error(error);
    } finally {
      yield put(actions.accountInfoUpdateCompleted());
    }
  }
}

function* watchAccountLoginStatusCheckRequest() {
  while (true) {
    try {
      yield take(actions.ACCOUNT_LOGIN_STATUS_CHECK_REQUEST);
      yield put(actions.accountInfoUpdateRequest());

      yield take(actions.ACCOUNT_INFO_UPDATE_COMPLETED);

      const isLoggedIn = yield select(getIsLoggedIn);
      if (!isLoggedIn) {
        yield put(actions.authFormOpenRequest(LOGIN_FORM));
      }
    } catch (error) {
      console.error(error);
    }
  }
}

function* watchTokenFetchFormOpenRequest() {
  yield takeEvery(actions.TOKEN_FETCH_FORM_OPEN_REQUEST, function*({regenerate}) {
    try {
      const modal = new FetchTokenModal({
        regenerate,
      });
      yield fork(::modal.open);
      yield take(actions.TOKEN_FETCH_SUCCESS);
      yield call(::modal.destroy);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(deleteError(/^fetchToken/));
    }
  });
}

function* watchTokenFetchRequest() {
  while (true) {
    try {
      const {password, regenerate} = yield take(actions.TOKEN_FETCH_REQUEST);

      yield put(updateFlagValue(selectors.IS_TOKEN_FETCH_IN_PROGRESS_KEY, true));

      const extraArgs = ['--json-output', '--password', password];
      if (regenerate) {
        extraArgs.push('--regenerate');
      }
      const {status, result} = yield call(runAccountCommand, 'token', {
        extraArgs: extraArgs,
      });

      if (status === 'success') {
        yield put(updateEntity(selectors.TOKEN_KEY, result));
        yield put(actions.tokenFetchSuccess());
        const verb = regenerate ? 'regenerated' : 'fetched';
        atom.notifications.addSuccess(`Token has been ${verb} successfully.`);
      }
    } catch (error) {
      yield put(updateError(selectors.FETCH_TOKEN_ERROR_KEY, error.message));
      console.error(error);
    } finally {
      yield put(updateFlagValue(selectors.IS_TOKEN_FETCH_IN_PROGRESS_KEY, false));
    }
  }
}

function* watchPasswordChangeRequest() {
  while (true) {
    try {
      const {oldPassword, newPassword} = yield take(actions.PASSWORD_CHANGE_REQUEST);

      yield put(updateFlagValue(selectors.IS_PASSWORD_CHANGE_IN_PROGRESS_KEY, true));
      yield call(runAccountCommand, 'password', {
        extraArgs: ['--old-password', oldPassword, '--new-password', newPassword],
      });
      atom.notifications.addSuccess('Password has been changed successfully!');
      yield put(deleteError(selectors.CHANGE_PASSWORD_ERROR_KEY));
    } catch (error) {
      console.error(error);
      yield put(updateError(selectors.CHANGE_PASSWORD_ERROR_KEY, error.message));
    } finally {
      yield put(updateFlagValue(selectors.IS_PASSWORD_CHANGE_IN_PROGRESS_KEY, false));
    }
  }
}

export default [
  watchAuthForm,
  watchLoginRequest,
  watchRegisterRequest,
  watchForgotPasswordRequest,
  watchLogoutRequest,
  watchAccountInfoUpdateRequest,
  watchAccountLoginStatusCheckRequest,
  watchTokenFetchFormOpenRequest,
  watchTokenFetchRequest,
  watchPasswordChangeRequest,
];
