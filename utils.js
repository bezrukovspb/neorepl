"use strict";

const request = require("request");
const babel = require("babel-core");
const babylon = require("babylon");

const replEval = (code, modulePath, callback) => {
  const message = {code: code, path: modulePath};

  const requestCallback = (err, resp, body) => {
    if (err) throw err;
    const message = body;
    let replErr = null;
    if (message.status !== "ok") {
      replErr = message.result;
    }
    callback.call(this, replErr, message);
  };

  request({
    method: "POST",
    body: message,
    json: true,
    url: "http://localhost:42042/"
  }, requestCallback);
}


const getExpression = (position, code) => {
  let ast = babylon.parse(code, { allowReturnOutsideFunction: true });

  const exp = ast.program.body.find((x) => {
    return x.start <= position && x.end >= position;
  });

  ast.program.body = [exp];

  const result = babel.transformFromAst(ast);


  return result.code;
}


exports.replEval = replEval;
exports.getExpression = getExpression;
