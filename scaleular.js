const DATA = {
  baseFontSize: 16,
  scale: 1.272,
  numberOfResizePoints: 6
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
    scaleProperty: "font-size",

  },
  {
    className: "Bold",
    defaultProperties: {
      "font-family": "$fontFamily-boldText",
      "font-weight": "bold",
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale"
    },
    scaleProperty: "font-size",
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
    scaleProperty: "font-size",
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
    scaleProperty: "font-size",
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

// const doT = require('dot');
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

const generateVariables = function(baseFontSize, scale, numberOfVars) {

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

console.log(generateVariables(DATA.baseFontSize, DATA.scale, DATA.numberOfResizePoints));

// STEP 2. Generate default layout
