"use strict";

const babel = require("babel-core");
const babylon = require("babylon");

const getExpression = (position, code) => {
  let ast = babylon.parse(code, { allowReturnOutsideFunction: true });

  const exp = ast.program.body.find((x) => {
    return x.start <= position && x.end >= position;
  });

  ast.program.body = [exp];

  const result = babel.transformFromAst(ast);
  return result.code;
}


exports.getExpression = getExpression;
