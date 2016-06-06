'use strict';

const spawn = require('child_process').spawn;
const path = require("path");

let neoreplProc;
let mochaProc;

const killProcs = () => {
  neoreplProc.kill('SIGINT');
  neoreplProc.kill('SIGTERM');
  mochaProc.kill('SIGINT');
  mochaProc.kill('SIGTERM');
}

neoreplProc = spawn("node",
                        ["./../../neorepl.js", "./main"],
                        { stdio: 'inherit', cwd: path.resolve(process.cwd(),
                        "./test/app")});
neoreplProc.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code);
  }
});

setTimeout(() => {
  mochaProc = spawn("mocha", [], { stdio: 'inherit' });
  mochaProc.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code);
    }
  });
}, 3000);

process.on('exit', (signal, code) => {
  killProcs();
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code);
  }
});

process.on('SIGINT', () => {
  killProcs();
});
