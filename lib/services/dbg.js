/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';

import { BufferedProcess, Disposable, Emitter } from 'atom';

import Telemetry from '../telemetry';
import fs from 'fs-plus';
import path from 'path';


let dbgService = null;
let lastProjectDebug = null;

export function DbgConsumer(service) {
  dbgService = service;
  dbgService.on('stop', () => terminateProjectDebug());
  return new Disposable(() => {
    terminateProjectDebug();
    dbgService = null;
  });
}

export function debugProject(projectDir, environment) {
  if (lastProjectDebug) {
    lastProjectDebug.terminate();
  }
  lastProjectDebug = new ProjectDebug(projectDir, environment);
  return lastProjectDebug.start();
}

function terminateProjectDebug() {
  if (!lastProjectDebug) {
    return;
  }
  lastProjectDebug.terminate();
  lastProjectDebug = null;
}


export class ProjectDebug {

  constructor(projectDir, environment) {
    this.projectDir = projectDir;
    this.environment = environment || this.getFirstProjectEnv();
    this.emitter = new Emitter();

    this._server_process = null;
    this._server_started = false;
    this._server_last_message = '';
  }

  async start() {
    let configuration = null;
    try {
      configuration = await this.loadConfiguration();
    } catch (err) {
      utils.notifyError('Could not load PIO Debug Configuration', err);
      return;
    }
    if (configuration.server) {
      let delayedTimer = null;
      this._server_process = this.startServer(configuration.server);
      this.emitter.on('server-started', () => {
        if (delayedTimer) {
          clearInterval(delayedTimer);
        }
        delayedTimer = setTimeout(() => {
          if (!this._server_process) {
            atom.notifications.addError('Could not start Debug Server', {
              detail: this._server_last_message,
              dismissable: true
            });
            return;
          }
          this.launchDbg(configuration);
        }, 500);
      });
    } else {
      this.launchDbg(configuration);
    }
  }

  loadConfiguration() {
    return new Promise((resolve, reject) => {
      utils.runPIOCommand(
        [
          'debug',
          '--project-dir', this.projectDir,
          '--environment', this.environment,
          '--configuration',
          '--json-output'
        ],
        (code, stdout, stderr) => {
          if (code !== 0) {
            return reject(stderr);
          }
          return resolve(JSON.parse(stdout));
        },
        {
          busyTitle: 'Loading debug configuration...'
        }
      );
    });
  }

  startServer(options) {
    if (this._server_process) {
      return this._server_process;
    }

    this._server_last_message = '';
    this.emitter.on('server-stdout', line => this.onDidServerMessage(line));
    // redirect stderr messages to stdout if OpenOCD server (it uses sterr all time)
    this.emitter.on('server-stderr', line => this.onDidServerMessage(line, !options.executable.includes('openocd')));
    this.emitter.on('server-exit', code => {
      if (code !== 0) {
        atom.notifications.addError('Debug Server exited with error', {
          detail: this._server_last_message,
          dismissable: true
        });
      }
      this.terminate();
    });

    const env =  Object.assign({}, process.env);
    const libPath = [options.cwd, path.join(options.cwd, 'lib')].join(path.delimiter);
    if (process.platform === 'darwin') {
      env.DYLD_LIBRARY_PATH = libPath;
    }
    else if (process.platform !== 'win32') {
      env.LD_LIBRARY_PATH = libPath;
    }

    let command = options.executable;
    if (fs.isExecutableSync(path.join(options.cwd, `${options.executable}_bin`))) {
      command = `${options.executable}_bin`;
    }

    const p = new BufferedProcess({
      command,
      args: options.arguments,
      options: {
        cwd: options.cwd,
        env
      },
      stdout: line => this.emitter.emit('server-stdout', line),
      stderr: line => this.emitter.emit('server-stderr', line),
      exit: code => this.emitter.emit('server-exit', code)
    });
    p.onWillThrowError(errorObject => {
      errorObject.handle();
      utils.notifyError('Could not start Debug Server', new Error(errorObject.error));
      this.terminate();
    });
    return p;
  }

  onDidServerMessage(message, isError = false) {
    if (!this._server_started) {
      this.emitter.emit('server-started');
    }
    this._server_started = true;
    this._server_last_message = message;
    if (isError) {
      console.error('Debug Server:', message);
    }
    // else {
    //   console.debug('Debug Server:', message);
    // }
  }

  launchDbg(options) {
    Telemetry.hitEvent('Debug', 'launch', `${options.tool}-${this.environment}`);
    dbgService.debug({
      debugger: 'dbg-gdb',
      path: options.prog_path,
      gdb_executable: options.gdb_path,
      gdb_commands: options.gdbinit
    });
  }

  terminate() {
    this.emitter.dispose();
    dbgService.stop();
    try {
      if (this._server_process) {
        this._server_process.kill();
      }
    } catch (err) {
      console.error('Kill Debug Server', err);
    }
    this._server_process = null;
    this._server_started = false;
  }

}
