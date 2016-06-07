'use strict';

const path = require("path");
const assert = require("chai").assert;
const request = require("request");

const replEval = (code, modulePath, callback) => {
  const message = {code: code, path: modulePath};

  const requestCallback = (err, resp, body) => {
    if (err) throw err;
    const message = body;
    let replErr = null;
    if (message.status !== "ok") {
      replErr = message.result;
    }
    callback.call(this, replErr, message.result);
  };

  request({
    method: "POST",
    body: message,
    json: true,
    url: "http://localhost:42042/"
  }, requestCallback);
}

describe("Modules test", () => {
  it("x should be defined only in root_x.js", (done) => {
    replEval("x;", path.resolve(__dirname, "./app/root_x.js"), (err, result) => {
      assert.equal(result, 111);
      done();
    });
  });

  it("y should be defined only in root_y.js", (done) => {
    replEval("y;", path.resolve(__dirname, "./app/root_y.js"), (err, result) => {
      assert.equal(result, 222);
      done();
    });
  });
});
