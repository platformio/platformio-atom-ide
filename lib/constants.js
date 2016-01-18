'use babel';

/**
 * Copyright (C) 2016 Ivan Kravets. All rights reserved.
 *
 * This source file is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import os from 'os';
import path from 'path';

export const WIN32 = Boolean(os.platform().indexOf('win32') > -1);
export const BASE_DIR = path.resolve(path.dirname(__filename), '..');
export const ENV_DIR = path.join(BASE_DIR, 'penv');
export const ENV_BIN_DIR = path.join(ENV_DIR, WIN32 ? 'Scripts' : 'bin');
export const PLATFORMIO_BASE_ARGS = ['-f', '-c', 'atom'];
