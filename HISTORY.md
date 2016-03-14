# Release Notes

## 1.0.6 (2016-03-??)

* Better handle an active project

## 1.0.5 (2016-03-07)

* Show progress information while initializing new project ([#49](https://github.com/platformio/platformio-atom-ide/issues/49))
* Highlight active project when more than one is opened (can be disabled
  in PlatformIO IDE Settings)
* Added settings for dependent packages to `Menu: PlatformIO > Settings` ([#57](https://github.com/platformio/platformio-atom-ide/issues/57))
* Added hotkey `cmd-shift-m / alt-shift-m` for Serial Monitor  ([#59](https://github.com/platformio/platformio-atom-ide/issues/59))
* Redirect for donation to main site http://platformio.org/donate
* Removed "Serial Ports List" from PlatformIO Toolbar
* Updated icons for Serial Monitor and Library Manager
* Fixed auto installer behind proxy ([#48](https://github.com/platformio/platformio-atom-ide/issues/48))
* Fixed loop in updater ([#55](https://github.com/platformio/platformio-atom-ide/issues/55), [#63](https://github.com/platformio/platformio-atom-ide/issues/63))
* Fixed issue with Serial Monitor when port contains spaces ([#62](https://github.com/platformio/platformio-atom-ide/issues/62))
* Fixed bug with incorrect determining of active project ([#58](https://github.com/platformio/platformio-atom-ide/issues/58))

## 1.0.4 (2016-02-20)

* Fixed IDE keep showing "Reload Now" popup at launch

## 1.0.3 (2016-02-20)

* Fixed installer for dependencies

## 1.0.2 (2016-02-20)

* Use PlatformIO DL infrastructure to download dependencies instead SourceForge

## 1.0.1 (2016-02-19)

* Automatically rebuild C/C++ Project Index (Autocomplete, Linter) for non IDE projects
* Improved layout for Init/Import Project panels
* Disable "Initialize" button while initializing new project (it may take for a while)
* Notify that Smart Code Linter is disabled by default for Arduino files (`*.ino` and `*.pde`)

## 1.0.0 (2016-02-18)

* New Terminal with PTY support
* Built-in Serial Monitor
* Implemented "Import Arduino IDE Project..."
* Added "Donate" form
* Remember serial port and speed when selecting Serial Monitor ([#31](https://github.com/platformio/platformio-atom-ide/issues/32))
* Fixed with multi-projects building ([#31](https://github.com/platformio/platformio-atom-ide/issues/31))

## 0.3.3 (2016-01-31)

* Temporary switched to `virtualenv` 14.0.1 because ([virtualenv bug #856](https://github.com/pypa/virtualenv/issues/856))

## 0.3.2 (2016-01-31)

* Note: Switched to PlatformIO development version
* Improved PlatformIO installer
* Fixed with ignoring position of Toolbar specified by user

## 0.3.1 (2016-01-29)

* Added `Find in Project...` button to Toolbar
* Set Toolbar to the left position by default

## 0.3.0 (2016-01-29)

* Added Toolbar with buttons for the most useful commands
* Generate env-specific build targets ([#10](https://github.com/platformio/platformio-atom-ide/issues/10))
* Reverted back "Serial Terminal"
* Allowed to rebuild C/C++ Project Index (Autocomplete, Linter) ([#20](https://github.com/platformio/platformio-atom-ide/issues/20))
* Multiple projects workflow within single window using `File > Add Project Folder...`.
* Allowed to use development version of PlatformIO (package settings)

## 0.2.1 (2016-01-25)

* Temporary disabled Serial Monitor (`kill` doesn't work)
* Fixed missed link for error line in the build output

## 0.2.0 (2016-01-25)

* Implemented Serial Monitor using [platformio serialports monitor](http://docs.platformio.org/en/latest/userguide/cmd_serialports.html#platformio-serialports-monitor) ([#13](https://github.com/platformio/platformio-atom-ide/issues/13))
* New improved Terminal for PlatformIO CLI (`pio`, `platformio`)
* Improved C/C++ code linting using PlatformIO’s platform dependent GCC toolchains
* Added `Library Manager` to menu
* Use short `pio` command instead of `platformio` in Terminal
* Fixed incorrect IDE version in `Menu: PlatformIO > Help > About`

## 0.1.1 (2016-01-24)

* Force intelligent code completion and code linting for `*.ino` and `*.pde` files
* Disabled progress bar for PlatformIO's package/library downloader and uploader

## 0.1.0 (2016-01-24)

* Birth! First release
