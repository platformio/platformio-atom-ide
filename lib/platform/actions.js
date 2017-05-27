/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export const LOAD_BOARDS = 'LOAD_BOARDS';
export const LOAD_REGISTRY_PLATFORMS = 'LOAD_REGISTRY_PLATFORMS';
export const LOAD_REGISTRY_FRAMEWORKS = 'LOAD_REGISTRY_FRAMEWORKS';
export const LOAD_PLATFORM_DATA = 'LOAD_PLATFORM_DATA';
export const LOAD_FRAMEWORK_DATA = 'LOAD_FRAMEWORK_DATA';
export const LOAD_INSTALLED_PLATFORMS = 'LOAD_INSTALLED_PLATFORMS';
export const LOAD_PLATFORM_UPDATES = 'LOAD_PLATFORM_UPDATES';

export const INSTALL_PLATFORM = 'INSTALL_PLATFORM';
export const UNINSTALL_PLATFORM = 'UNINSTALL_PLATFORM';
export const UPDATE_PLATFORM = 'UPDATE_PLATFORM';

function action(type, payload = {}) {
  return {
    type,
    ...payload
  };
}

export const loadBoards = () => action(LOAD_BOARDS);
export const loadRegistryPlatforms = () => action(LOAD_REGISTRY_PLATFORMS);
export const loadRegistryFrameworks = () => action(LOAD_REGISTRY_FRAMEWORKS);
export const loadPlatformData = name => action(LOAD_PLATFORM_DATA, { name });
export const loadFrameworkData = name => action(LOAD_FRAMEWORK_DATA, { name });
export const loadInstalledPlatforms = () => action(LOAD_INSTALLED_PLATFORMS);
export const loadPlatformUpdates = () => action(LOAD_PLATFORM_UPDATES);

export const installPlatform = (platform, onEnd=undefined) => action(INSTALL_PLATFORM, { platform, onEnd });
export const uninstallPlatform = (pkgDir, onEnd=undefined) => action(UNINSTALL_PLATFORM, { pkgDir, onEnd });
export const updatePlatform = (pkgDir, onEnd=undefined) => action(UPDATE_PLATFORM, { pkgDir, onEnd });
