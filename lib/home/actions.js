/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export const RESET_STORE = 'RESET_STORE';
export const UPDATE_ENTITY = 'UPDATE_ENTITY';
export const DELETE_ENTITY = 'DELETE_ENTITY';
export const UPDATE_INPUT_VALUE = 'UPDATE_INPUT_VALUE';
export const LAZY_UPDATE_INPUT_VALUE = 'LAZY_UPDATE_INPUT_VALUE';

function action(type, payload = {}) {
  return { type, ...payload };
}

export const resetStore = () => action(RESET_STORE);
export const updateEntity = (key, data) => action(UPDATE_ENTITY, { key, data });
export const deleteEntity = re => action(DELETE_ENTITY, { re });
export const updateInputValue = (key, value) => action(UPDATE_INPUT_VALUE, { key, value });
export const lazyUpdateInputValue = (key, value, delay=0) => action(LAZY_UPDATE_INPUT_VALUE, { key, value, delay });
