# Release History

## 0.3.0 (2016-01-29)

* Added Toolbar with buttons for the most useful commands
* Generate env-specific build targets, [issue #10](https://github.com/platformio/platformio-atom-ide/issues/10)
* Reverted back "Serial Terminal"
* Allowed to rebuild C/C++ Project Index (Autocomplete, Linter), [issue #20](https://github.com/platformio/platformio-atom-ide/issues/20)
* Multiple projects workflow within single window using `File > Add Project Folder...`.
* Allowed to use development version of PlatformIO (package settings)

## 0.2.1 (2016-01-25)

* Temporary disabled Serial Monitor (`kill` doesn't work)
* Fixed missed link for error line in the build output

## 0.2.0 (2016-01-25)

* Implemented Serial Monitor using [platformio serialports monitor](http://docs.platformio.org/en/latest/userguide/cmd_serialports.html#platformio-serialports-monitor), [issue #13](https://github.com/platformio/platformio-atom-ide/issues/13)
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
