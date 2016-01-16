# Copyright (C) 2016 Ivan Kravets. All rights reserved.
#
# This source file is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 2
# as published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

"""Add paths to Windows %PATH% environment variable."""

import os
import sys
import ctypes
from ctypes.wintypes import HWND, UINT, WPARAM, LPARAM, LPVOID
try:
    import winreg
except ImportError:
    import _winreg as winreg  # PY2

def main():
    with winreg.CreateKey(winreg.HKEY_CURRENT_USER, u"Environment") as key:
        try:
            envpath = winreg.QueryValueEx(key, u"PATH")[0]
        except WindowsError:
            envpath = u"%PATH%"

        paths = [envpath]
        for path in sys.argv[1:]:
            if path and path not in envpath and os.path.isdir(path):
                paths.append(path)
        envpath = os.pathsep.join(paths)

        winreg.SetValueEx(key, u"PATH", 0, winreg.REG_EXPAND_SZ, envpath)
        print "Value set!"

    winreg.ExpandEnvironmentStrings(envpath)
    print "Expanded!"

    # notify the system about the changes
    SendMessage = ctypes.windll.user32.SendMessageW; print 1
    SendMessage.argtypes = HWND, UINT, WPARAM, LPVOID; print 2
    SendMessage.restype = LPARAM; print 3
    SendMessage(0xFFFF, 0x1A, 0, u"Environment"); print 4
    print "Message sent!"

if __name__ == '__main__':
    main()
