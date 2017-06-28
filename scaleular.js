const DATA = require("./data.js");
const UTILS = require("./utils.js");
const doT = require('dot');
const numberConverter = require('number-to-words');
const colorNamer = require('color-namer');

/* Gets the next level down for the scale given the base font size. */
const getDownRemNumber = function (baseFontSize, scale, number) {

  divisionResults = baseFontSize / scale;

  if (number >= 2) {

    for (let i = 1; i < number; i += 1) {
      divisionResults /= scale;
    }

  }

  return divisionResults / baseFontSize;

}

const variableGenerator = function(baseFontSize, scale, numberOfVars) {

  let output = "";

  output += '$scale-default: 1rem;' + "\n";

  let upVariables = "";
  let downVariables = "";

  for (let i = 1; i <= numberOfVars; i += 1) {

    const numberWord = numberConverter.toWords(i).replace(/ /g,'');


    upVariables += '$scale-' + numberWord + '-up: ' + Math.pow(scale, i) + 'rem;' + "\n";
    downVariables += '$scale-' + numberWord + '-down: ' + getDownRemNumber(baseFontSize, scale, i) + 'rem;' + "\n";

  }

  output += upVariables + "\n";
  output += downVariables + "\n";

  return output;

}

// STEP 2. Generate the layout.

/*
 * @description: Generates a single class in the form of &.TopSpacer--default { padding-top: $scale-default }
 *
 * The template takes the following variables
 * {
      prefix:String - "one", "two", "three", etc - Used for generating responsive layouts.
      className:String - The name of the class layout part.
      modifier:String "default", "oneUp", "twoUp", "oneDown', etc. Which size?
      properties:Array<String> The properties that this class will use. ["padding-top", etc.],
      propertyValue: "$scale-default", "$scale-one-up", etc. Which size?
    }
  *
*/
const singleLayoutClass = doT.template(

  `
  {{?it.prefix}}
  &.{{=it.prefix}}-{{=it.className}}--{{=it.modifier}} {
  {{??}}
  &.{{=it.className}}--{{=it.modifier}} {
  {{?}}
    {{~it.properties :propertyName}}
      {{=propertyName}}: {{=it.propertyValue}};
    {{~}}
  }`

);

/*
 * @description: Generates the shell of the layout part in the form TopSpacer { &.TopSpacer--default { } }
 *
 * The template takes the following variables
 * {
      className:String - The name of the class layout part.
      generatedClasses:Array<String> All of the generated classes using singleLayoutClass function for this particular className.
    }
  *
*/
const allLayoutParts = doT.template(
  `
  .{{=it.className}} {
    {{~it.generatedClasses :generatedClass}}
      {{=generatedClass}}
    {{~}}
  }
  `
);

/*
 * @description - Returns the appropriate $scale variable based on the number that's passed in
 * @param number:Integer
 * @param direction:String - The string of either "up" or "down"
 * @param returnVariable: Boolean - If true return "$scale-default" form, else return "default" or "oneUp" form.
 * @return String */
const getScaleBasedOnNumber = function(number, direction, returnVariable) {

  const numberWord = numberConverter.toWords(number).replace(/ /g,'');

  if (number === 0) {
    return returnVariable ? "$scale-default" : "default";
  } else {
    const uppercasedDirection = direction.charAt(0).toUpperCase() + direction.slice(1);
    return returnVariable ? "$scale-" + numberWord.toLowerCase() + "-" + direction.toLowerCase() : numberWord.toLowerCase() + uppercasedDirection;

  }
};

/*
 * @decription - for a given classname and some properties generates all of the sizes.
 * example: .TopSpacer { &.TopSpacer--default { padding-top: $scale-default } } but for every size, so a bunch of classes.
 * @return String
 */
const generateScaledClasses = function (className, properties) {

  let individualLayoutClasses = [];

  for (let j = 0; j <= DATA.numberOfSizes; j += 1) {

    individualLayoutClasses.push(
      singleLayoutClass({
        className: className,
        modifier: getScaleBasedOnNumber(j, "up", false),
        properties: properties,
        propertyValue: getScaleBasedOnNumber(j, "up", true)
      })
    );
  }

  // Starting off at one this time for the "down" sizes so that --default doesn't get
  // generated again.
  for (let j = 1; j <= DATA.numberOfSizes; j += 1) {

    individualLayoutClasses.push(
      singleLayoutClass({
        className: className,
        modifier: getScaleBasedOnNumber(j, "down", false),
        properties: properties,
        propertyValue: getScaleBasedOnNumber(j, "down", true)
      })
    );
  }

  return individualLayoutClasses;

};

const generateColorClasses = function (className) {

  const colorClasses = [];

  for (let i = 0; i < DATA.COLORS.length; i += 1) {
    const customColorName = UTILS.camelize(colorNamer(DATA.COLORS[i]).ntc[0].name);
    colorClasses.push(
      singleLayoutClass({
        className: className,
        modifier: customColorName,
        properties: ["color"],
        propertyValue: DATA.COLORS[i]
      })
    );
  }

  return colorClasses;
};

const generatePureLayout = function () {


    let pureLayoutText = "";

    // Need to get the appropriate $scale variable in here and pass that in when creating the
    for (let i = 0; i < DATA.PURE_LAYOUT.length; i += 1) {
      pureLayoutText += allLayoutParts({
        className: DATA.PURE_LAYOUT[i].className,
        generatedClasses: generateScaledClasses(DATA.PURE_LAYOUT[i].className, DATA.PURE_LAYOUT[i].properties)
      });
    }

    return pureLayoutText;
};

const generateNonPureLayout = function () {

  // Need to get the appropriate $scale variable in here and pass that in when creating the
  for (let i = 0; i < DATA.NONPURE_LAYOUT.length; i += 1) {


    if ("modifiers" in DATA.NONPURE_LAYOUT[i]) {

      let modifierClasses = [];

      DATA.NONPURE_LAYOUT[i].modifiers.forEach(function (modifier) {

        const arrayedModifierProperties = [modifier.modifierProperty];

        const modifierClass = singleLayoutClass({
          className: DATA.NONPURE_LAYOUT[i].className,
          modifier: modifier.modifierName,
          properties: arrayedModifierProperties,
          propertyValue: modifier.modifierValue
        });

        modifierClasses.push(modifierClass);
      });

    }

    if ("scaleProperties" in DATA.NONPURE_LAYOUT[i]) {
      const scaledClasses = generateScaledClasses(DATA.NONPURE_LAYOUT[i].className, DATA.NONPURE_LAYOUT[i].scaleProperties);
    }

    if ("color" in DATA.NONPURE_LAYOUT[i]) {
      const colorClasses = generateColorClasses(DATA.NONPURE_LAYOUT[i].className);
    }

  }

};

// What's left? Generating default-properties, colors, line-heights, and then responsive versions of everything.

// In terms of default-properties I feel like that's something `allLayoutParts` should be concerned with. Like passing it as a variable and iterating or somethign.
// console.log("pure-layout");
// console.log(generatePureLayout());


console.log("numberConverter(1.25)", numberConverter);
