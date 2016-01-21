# PlatformIO IDE for Atom

[PlatformIO](http://platformio.org/) is an open source ecosystem
for IoT development. Cross-platform code builder and library manager.
Continuous and IDE integration. Arduino and MBED compatible.
Ready for Cloud compiling.

*Atmel AVR & SAM, Espressif, Freescale Kinetis, Nordic nRF51, NXP LPC,
Silicon Labs EFM32, ST STM32, TI MSP430 & Tiva, Teensy, Arduino, mbed,
libOpenCM3, ESP8266, etc.*

## Features

* Cross-platform Project builder without external dependencies to the system software (200+ embedded boards, 15+ development platforms and 10+ frameworks).
* C/C++ Intellisense (smart code autocompletion)
* Linter for C/C++ code

## Requirements

* **Python Interpreter**: Python 2.6 or 2.7 (*Windows OS*: Please [Download the latest Python 2.7.x](https://www.python.org/downloads/)
  and install it. DON’T FORGET to select `Add python.exe to PATH` feature on
  the "Customize" stage, otherwise `python` command will not be available).
* **Git**: Please [install the latest version](https://git-scm.com/downloads).
  Check that `git --version` command works in Terminal.

## Using

### Building / Programming / Uploading

* `cmd-alt-t` / `ctrl-alt-t` / `f7` Displays the available targets (build, upload, program, uploadfs, clean, etc).
* `cmd-alt-b` / `ctrl-alt-b` / `f9` build project without auto-uploading.
* `ctrl-alt-u` / build and upload (if no errors).
* `cmd-alt-g` / `ctrl-alt-g` / `f4` cycles through causes of build error.
* `cmd-alt-h` / `ctrl-alt-h` / `shift-f4` goes to the first build error.
* `cmd-alt-v` / `ctrl-alt-v` / `f8` Toggles the build panel.
* `escape` terminates build / closes the build window.

### Code autocompletion and Linting

PlatformIO IDE uses [clang](http://clang.llvm.org) for the code autocompletion
and linting. To check if `clang` is available in your system, please open
Terminal and run `> clang -v`. If `clang` is not installed, then install it:

- **Mac OS X**: Install the latest Xcode along with the latest Command Line Tools
  (they are installed automatically when you run `clang` in Terminal for the
  first time, or manually by running `xcode-select --install`
- **Windows**: Download the latest [Clang for Windows](http://llvm.org/releases/download.html).
  Please select "Add to PATH" option on the installation step.
- **Linux**: Using package managers: `apt-get install clang` or `yum install clang`.
- **Other**: Download the latest [Clang for the other systems](http://llvm.org/releases/download.html).

**Warning**: If you have previously generated PlatformIO project you need to
reinitialize it using `Menu: PlatformIO > Initialize new Project (or update exiting)`
and specify for the which board should be generated Code autocompletion and Linting data.

## Licence

Copyright (C) 2016 Ivan Kravets. All rights reserved.
