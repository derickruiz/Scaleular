const UTILS = require("./utils.js");

test("UTILS.objectFromArrays", function (assert) {

  const modifierProperties = ["flex-direction", "justify-content"],
        modifierValues     = ["column", "center"];

  const correctAnswer = {
    "flex-direction": "column",
    "justify-content": "center"
  };

  assert.deepEqual(UTILS.objectFromArrays(modifierProperties, modifierValues), correctAnswer);

});

test("UTILS.decimalToWord", function (assert) {

    let decimalToWords = [{
      decimal: "1.2",
      answer: "OneTwo"
    },
    {
      decimal: "1.4",
      answer: "OneFour"
    },
    {
      decimal: "0",
      answer: "Zero"
    },
    {
      decimal: "2",
      answer: "Two"
    },
    {
      decimal: "1.618",
      answer: "OneSixOneEight"
    },
    {
      decimal: "0.45",
      answer: "ZeroFourFive"
    }];

    decimalToWords.forEach(function (decimalAnswerPair) {
      assert.equal(UTILS.decimalToWord(decimalAnswerPair.decimal), decimalAnswerPair.answer);
    });
});
