'use strict';

const path = require("path");
const assert = require("chai").assert;

const utils = require("../utils");

describe("Modules test", () => {
  it("x should be defined only in root_x.js", (done) => {
    utils.replEval("x;", path.resolve(__dirname, "./app/root_x.js"), (err, answer) => {
      assert.equal(answer.result, 111);
      done();
    });
  });

  it("y should be defined only in root_y.js", (done) => {
    utils.replEval("y;", path.resolve(__dirname, "./app/root_y.js"), (err, answer) => {
      assert.equal(answer.result, 222);
      done();
    });
  });
});

describe("Expression extractor and executor test", () => {
  const code = `
  "use strict";
  const x = 115;
  let y = 20;
  (((x) + y));
  if (x) {
    y = 50;
  };
  const z = x + y;
  `;

  it("Should extract a right expression", () => {
    assert.equal(utils.getExpression(62, code), '\n"use strict";\n\nx + y;');
    assert.equal(utils.getExpression(46, code), '\n"use strict";\n\nlet y = 20;');
  });


  it("Should return a right evaluation result", () => {
    const child_process = require("child_process");
    const replPath = path.resolve(__dirname, "./app/root_y.js");

    let replPosition = 26;
    let answer = child_process.execSync(`neorepl --repl-position=${replPosition} --repl-path="${replPath}"`,
                                          {input: code,
                                           encoding: "utf8",
                                           timeout: 15 * 1000})

    replPosition = 58;

    answer = child_process.execSync(`neorepl --repl-position=${replPosition} --repl-path="${replPath}"`,
                                          {input: code,
                                           encoding: "utf8",
                                           timeout: 15 * 1000})
    let result = JSON.parse(answer).result;
    assert.equal(result, 337); // x + y (y == 222, x == 115)
  });
});
