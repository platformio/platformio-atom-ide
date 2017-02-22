# Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
#
# License: https://pioplus.com/license.html
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

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
