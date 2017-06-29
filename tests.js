const testrunner = require("qunit");

// one code and tests file
testrunner.run({
    code: "./utils.js",
    tests: "./utils.tests.js"
});
