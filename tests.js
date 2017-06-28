const testrunner = require("qunit");

// one code and tests file
testrunner.run({
    code: "./utils.js",
    tests: "./utils.tests.js"
}, function (one, two, three) {
  console.log("one", one);
  console.log("two", two);
  console.log("three", three);
});
