/** @babel */

/**
 * Copyright (с) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export const LOAD_STATS = 'LOAD_STATS';
export const LOAD_SEARCH_RESULT = 'LOAD_SEARCH_RESULT';
export const LOAD_LIBRARY_DATA = 'LOAD_LIBRARY_DATA';
export const LOAD_BUILTIN_LIBS = 'LOAD_BUILTIN_LIBS';
export const LOAD_INSTALLED_LIBS = 'LOAD_INSTALLED_LIBS';
export const LOAD_LIB_UPDATES = 'LOAD_LIB_UPDATES';

export const INSTALL_LIBRARY = 'INSTALL_LIBRARY';
export const UNINSTALL_LIBRARY = 'UNINSTALL_LIBRARY';
export const UPDATE_LIBRARY = 'UPDATE_LIBRARY';

function action(type, payload = {}) {
  return {
    type,
    ...payload
  };
}

export const loadStats = (force=false) => action(LOAD_STATS, { force });
export const loadSearchResult = (query, page=1) => action(LOAD_SEARCH_RESULT, { query, page });
export const loadLibraryData = idOrManifest => action(LOAD_LIBRARY_DATA, { idOrManifest });
export const loadBuiltinLibs = () => action(LOAD_BUILTIN_LIBS);
export const loadInstalledLibs = () => action(LOAD_INSTALLED_LIBS);
export const loadLibUpdates = () => action(LOAD_LIB_UPDATES);

export const installLibrary = (lib, onEnd=undefined) => action(INSTALL_LIBRARY, { lib, onEnd });
export const uninstallLibrary = (storageDir, pkgDir, onEnd=undefined) => action(UNINSTALL_LIBRARY, { storageDir, pkgDir, onEnd });
export const updateLibrary = (storageDir, pkgDir, onEnd=undefined) => action(UPDATE_LIBRARY, { storageDir, pkgDir, onEnd });
