const numberConverter = require('number-to-words');

/*
 * @source: https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 */
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/* @description: Take a decimal 1.4 for example and generate a string "oneFour"; */
function decimalToWord(decimal) {

  let result = "";

  let splitDecimal;

  // If it's just a normal
  if (decimal.indexOf(".") !== -1) {

    let splitDecimal = decimal.split(".");

    result += capitalize(numberConverter.toWords(splitDecimal[0]).toLowerCase());

    splitDecimal[1].split("").forEach(function (individualNumber) {
      result += capitalize(numberConverter.toWords(individualNumber));
    });

  } else { // If it's just a normal number, just go ahead and convert that into a word.
    result += capitalize(numberConverter.toWords(decimal).toLowerCase());
  }

  return result;
}

module.exports = {
  camelize: camelize,
  decimalToWord: decimalToWord,
  capitalize: capitalize
}
