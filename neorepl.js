#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const vm = require("vm");
const internalModule = require("./internal/module");
const express = require('express');
const bodyParser = require('body-parser');

var Module = require("module");
const nodeRequire = Module.prototype.require;
const nodeCompile = Module.prototype._compile;

const findRequest = function (request) {
    var resolvedPath = request;
    if (request.charCodeAt(0) === 46 /*.*/) {
      resolvedPath = path.resolve(__dirname, request);
    }

    return ["", ".js", ".json"].map(function (it) {
      try {
        fs.statSync(resolvedPath + it);
        return resolvedPath;
      } catch (err) {
        return null;
    }}).find(function (it) { return it !== null});
}

const nrCompile = function (content, filename) {
  const wrapper = content + "; module.exports;";

  const context = Object.create(global);
  context.module = this;
  context.require = internalModule.makeRequireFunction.call(this)
  context.global = global;
  context.filename = filename;
  context.lineOffset = 0;
  context.displayErrors = true;
  context.findRequest = findRequest;
  context.__dirname = this.__requestDirname;

  this.__context__ = vm.createContext(context);
  return vm.runInContext(wrapper, this.__context__);
};


Module.prototype.require = function (request) {
  const foundRequest = findRequest(request);

  if (foundRequest && request.indexOf("node_modules") < 0) {
    Module.prototype._compile = nrCompile;
    this.__requestDirname = path.dirname(foundRequest);
  } else {
    Module.prototype._compile = nodeCompile;
  }
  return nodeRequire.call(this, request);
};


const filename = process.cwd() + "/neorepl.js";
module.id = filename;
module.filename = filename;
__dirname = process.cwd();


if (process.argv.length === 3) {
  require(process.argv[2]);
} else {
  require("./index");
}

const evalCode = function (code, moduleId) {
  const cachedModule = Module._cache[moduleId];
  if (cachedModule && cachedModule.hasOwnProperty("__context__")){
    return vm.runInContext(code, cachedModule.__context__);
  }
}

var app = express();
app.use(bodyParser.json());

app.post('/', function (req, res) {
  const message = req.body;
  const result = evalCode(message.code, message.path);
  res.json({result: result, status: "ok"});
});

const port = 42042;
const host = "127.0.0.1";

app.listen(port, host, function () {
  console.log('NeoREPL is running on http://' + host + ":" + port);
});
