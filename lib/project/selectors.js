/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fuzzaldrin from 'fuzzaldrin-plus';
import { getInputValue } from '../core/selectors';


export const INPUT_FILTER_KEY = 'projectFilter';

export function getFilter(state) {
  return getInputValue(state, INPUT_FILTER_KEY);
}

export function getProjects(state) {
  return state.entities.projects || null;
}

export function getVisibleProjects(state) {
  const filterValue = getFilter(state);
  const projects = getProjects(state);
  if (!projects) {
    return null;
  } else if (!filterValue) {
    return projects;
  }
  return fuzzaldrin.filter(projects, filterValue);
}
