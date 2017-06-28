const UTILS = require("./utils.js");

test("UTILS.decimalToWord", function (assert) {

    let decimalToWords = [{
      decimal: "1.2",
      answer: "oneTwo"
    },
    {
      decimal: "1.4",
      answer: "oneFour"
    },
    {
      decimal: "0",
      answer: "zero"
    },
    {
      decimal: "2",
      answer: "two"
    },
    {
      decimal: "1.618",
      answer: "oneSixOneEight"
    },
    {
      decimal: "0.45",
      answer: "zeroFourFive"
    }];

    decimalToWords.forEach(function (decimalAnswerPair) {
      assert.equal(UTILS.decimalToWord(decimalAnswerPair.decimal), decimalAnswerPair.answer);
    });
});
