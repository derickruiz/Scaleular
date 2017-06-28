const DATA = {
  baseFontSize: 16,
  scale: 1.272,
  numberOfResizePoints: 6,
  numberOfSizes: 8
};

const VARIABLES = `

  $fontFamily-text:   Arial, sans-serif;
  $fontFamily-boldText:   Arial, sans-serif;
  $fontFamily-italicText: Arial, sans-serif;
  $fontFamily-condensedText: Arial, sans-serif;

`;

const LINE_HEIGHTS = ["1", "1.2", "1.25", "1.3", "1.5", "1.618", "2"];
const COLORS = ["#4C4C4C", "#42ACEE", "#0007DC"];

const PURE_LAYOUT = [
  {
    className: "TopSpacer",
    properties: ["padding-top"]
  },
  {
    className: "BottomSpacer",
    properties: ["padding-bottom"]
  },
  {
    className: "RightSpacer",
    properties: ["margin-left"]
  },
  {
    className: "LeftSpacer",
    properties: ["margin-left"]
  },
  {
    className: "HorizontalConstrainer",
    properties: ["padding-left", "padding-right"]
  },
  {
    className: "VerticalConstrainer",
    properties: ["padding-top", "padding-bottom"]
  }
];

const NONPURE_LAYOUT = [
  {
    className: "TextAligner",
    modifiers: [
      {
        modifierName:     "center",
        modifierProperty: "text-align",
        modifierValue:    "center"
      },
      {
        modifierName:     "right",
        modifierProperty: "text-align",
        modifierValue:    "right"
      },
      {
        modifierName:     "left",
        modifierProperty: "text-align",
        modifierValue:    "left"
      }
    ]
  },
  {
    className: "HorizontalSizer",
    modifiers: [
      {
        modifierName:     "max",
        modifierProperty: "width",
        modifierValue:    "100%"
      },
      {
        modifierName:     "center",
        modifierProperty: "margin",
        modifierValue:    "0 auto"
      }
    ],
    scaleProperty: ["max-width"]
  },
  {
    className: "Shower",
    modifiers: [
      {
        modifierName:     "hide",
        modifierProperty: "display",
        modifierValue:    "none"
      },
      {
        modifierName:     "show",
        modifierProperty: "display",
        modifierValue:    "block"
      }
    ]
  },
  {
    className: "Text",
    defaultProperties: {
      "font-family": "$fontFamily-text",
      "font-weight": "normal",
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale"
    },
    scaleProperties: ["font-size"]

  },
  {
    className: "Bold",
    defaultProperties: {
      "font-family": "$fontFamily-boldText",
      "font-weight": "bold",
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale"
    },
    scaleProperties: ["font-size"],
    colors: true,
    lineHeights: true
  },
  {
    className: "Italic",
    defaultProperties: {
      "font-family": "$fontFamily-italicText",
      "font-weight": "normal",
      "font-style":  "italic",
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale"
    },
    scaleProperties: ["font-size"],
    color: true,
    lineHeights: true
  },
  {
    className: "Condensed",
    defaultProperties: {
      "font-family": "$fontFamily-condensedText",
      "font-weight": "normal",
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale"
    },
    scaleProperties: ["font-size"],
    color: true,
    lineHeights: true
  },
  {
    className: "Grid",
    defaultProperties: {
      "display": "flex",
      "flex-wrap": "wrap",
      "list-style": "none",
      "margin": "0",
      "padding": "0"
    },
    modifiers: [
      {
        modifierName:     "center",
        modifierProperty: "justify-content",
        modifierValue:    "center"
      },
      {
        modifierName:     "inline",
        modifierProperty: "display",
        modifierValue:    "inline-flex"
      },
      {
        modifierName:     "reverse",
        modifierProperty: "flex-direction",
        modifierValue:    "row-reverse"
      }
    ]
  }
];

/* The typography modifier adds all of the typography related modifiers to each class.
 * --sublte, --tight, --light for example and their associated responsive styles
 *
 * The grid modifier adds all of the grid related modifiers to the grid.
 * --center, --inline, --reverse
 */


// 1. Compile template function
// var tempFn = doT.template(`
// {{?it.prefix}}
// .{{=it.prefix}}-{{=it.className}} {
// {{??}}
// .{{=it.className}} {
// {{?}}
//  {{=it.property}}: {{=it.value}}
// }`);
//
// // 2. Use template function as many times as you like
// const resultText = tempFn({
//   prefix: "four",
//   className: "Hello",
//   property: "display",
//   value: "block"
// });

const doT = require('dot');
const numberConverter = require('number-to-words');
// const colorNamer = require('color-namer');

// STEP 1. Generate scale variables
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

const generatePureLayout = function () {


    let pureLayoutText = "";

    // Need to get the appropriate $scale variable in here and pass that in when creating the
    for (let i = 0; i < PURE_LAYOUT.length; i += 1) {
      pureLayoutText += allLayoutParts({
        className: PURE_LAYOUT[i].className,
        generatedClasses: generateScaledClasses(PURE_LAYOUT[i].className, PURE_LAYOUT[i].properties)
      });
    }

    return pureLayoutText;
};

const generateNonPureLayout = function () {

  // Need to get the appropriate $scale variable in here and pass that in when creating the
  for (let i = 0; i < NONPURE_LAYOUT.length; i += 1) {


    if ("modifiers" in NONPURE_LAYOUT[i]) {

      let modifierClasses = [];

      NONPURE_LAYOUT[i].modifiers.forEach(function (modifier) {

        const arrayedModifierProperties = [modifier.modifierProperty];

        const modifierClass = singleLayoutClass({
          className: NONPURE_LAYOUT[i].className,
          modifier: modifier.modifierName,
          properties: arrayedModifierProperties,
          propertyValue: modifier.modifierValue
        });

        modifierClasses.push(modifierClass);
      });

    }

    if ("scaleProperties" in NONPURE_LAYOUT[i]) {
      const scaledClasses = generateScaledClasses(NONPURE_LAYOUT[i].className, NON_PURELAYOUT[i].scaleProperties);
    }

  }

};

// console.log("pure-layout");
// console.log(generatePureLayout());
