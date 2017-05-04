/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';
import AuthModal from './containers/auth-modal';

const USERNAME_KEY = 'platformio-ide:pioplus-username';
const USER_IS_LOGGED_IN_KEY = 'platformio-ide:pioplus-logged-in';
const USER_IS_LOGGED_IN_VALUE = 'USER_IS_LOGGED_IN';



export function runAccountCommand(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    let args = ['account', cmd];
    if (options.extraArgs) {
      args = args.concat(options.extraArgs);
    }
    utils.runPIOCommand(
      args,
      (code, stdout, stderr) => {
        if (code !== 0) {
          const error = new Error(stderr);
          return reject(error);
        }
        resolve(args.includes('--json-output') ? JSON.parse(stdout) : stdout);
      }
    );
  });
}

export async function runPioAccountLogout() {
  await runAccountCommand('logout');
  setUserLoggedInStatus(false);
}


export function runPioAccountForgotPassword(username) {
  return runAccountCommand('forgot', {
    extraArgs: ['--username', username],
  });
}

export function runPioAccountChangePassword(oldPassword, newPassword) {
  return runAccountCommand('password', {
    extraArgs: ['--old-password', oldPassword, '--new-password', newPassword],
  });
}


export async function maybeAuthModal(formType = null) {
  try {
    const result = await getAccountStatus();
    setUsername(result.username);
    setUserLoggedInStatus(true);
  } catch (e) {
    setUserLoggedInStatus(false);
    const modal = new AuthModal({
      formType,
    });
    await modal.open();
  }
}

export function getAccountStatus(options = {}) {
  options.extraArgs = options.extraArgs || ['--offline', '--json-output'];
  return runAccountCommand('show', options);
}

export function setUsername(username) {
  localStorage.setItem(USERNAME_KEY, username);
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY);
}

export function removeUsername() {
  localStorage.removeItem(USERNAME_KEY);
}

export function isUserLoggedIn() {
  return Boolean(localStorage.getItem(USER_IS_LOGGED_IN_KEY));
}

export function setUserLoggedInStatus(isLoggedIn) {
  if (isLoggedIn) {
    localStorage.setItem(USER_IS_LOGGED_IN_KEY, USER_IS_LOGGED_IN_VALUE);
  } else {
    localStorage.removeItem(USER_IS_LOGGED_IN_KEY);
  }
}
