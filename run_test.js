var spawn = require('child_process').spawn;
var path = require("path");

var neoreplProc = spawn("node",
                        ["./../../neorepl.js", "./main"],
                        { stdio: 'inherit', cwd: path.resolve(process.cwd(),
                        "./test/app")});
                        
neoreplProc.on('exit', function (code, signal) {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code);
  }
});

var mochaProc = spawn("mocha", [], { stdio: 'inherit' });
mochaProc.on('exit', function (code, signal) {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code);
  }
});

function killProcs() {
  neoreplProc.kill('SIGINT');
  neoreplProc.kill('SIGTERM');

  mochaProc.kill('SIGINT');
  mochaProc.kill('SIGTERM');
}

process.on('exit', function(signal, code){
  killProcs();
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code);
  }
});

process.on('SIGINT', function () {
  killProcs();
});
