const DATA = require("./data.js");
const UTILS = require("./utils.js");
const doT = require('dot');
const numberConverter = require('number-to-words');
const colorNamer = require('color-namer');
const fs = require('fs');

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

const getCustomColorName = (function () {

  var names = {};

  function getName(colorCode, iterator) {

    const customColorName = UTILS.camelize(colorNamer(colorCode).ntc[iterator].name);

    if (typeof names[customColorName] === "undefined") {
      names[customColorName] = true;
      return customColorName;
    } else {
      return getName(colorCode, iterator + 1);
    }

  }

  return getName;

}());

const COLOR_CACHE = (function () {

  let colors = {};

  for (let i = 0; i < DATA.COLORS.length; i += 1) {
    colors[DATA.COLORS[i]] = getCustomColorName(DATA.COLORS[i], 0);
  }

  return colors;

}());

/*
 * @description - Returns the percentage of i to n.
 * @example: getPercentage(1, 8) is = 12.5;
 * @return String
 */
const getPercentage = function(i, n) {
  const outOf100 = 100 / n;
  return outOf100 * i;
};

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
  &.{{=it.className}}--{{=it.modifier}}{{?it.child}} > {{=it.child}}{{?}} {
  {{?}}
    {{ for(var prop in it.propertyKeyValues) { }}
      {{=prop}}: {{=it.propertyKeyValues[prop]}};
    {{ } }}
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

    {{?it.defaultProperties}}
      {{ for(var prop in it.defaultProperties) { }}
        {{=prop}}: {{=it.defaultProperties[prop]}};
      {{ } }}
    {{?}}

    {{~it.generatedClasses :generatedClass}}
      {{=generatedClass}}
    {{~}}

  }
  `
);

const responsiveLayoutShell = doT.template(
  `
  @media #{$resizePoint-{{=it.resizePoint}}} {
    {{=it.responsiveGeneratedLayoutClasses}}
  }
  `
);
/*
 * @description - Returns the appropriate $scale variable based on the number that's passed in
 * @param number:Integer
 * @param direction:String - The string of either "up" or "down"
 * @param returnVariable: Boolean - If true return "$scale-default" form, else return "default" or "oneUp" form.
 * @return String */
const getScaleBasedOnNumber = function(number, direction, options) {

  options = options || {};
  let returnValue = "";

  const numberWord = numberConverter.toWords(number).replace(/ /g,'');

  if (number === 0) {
    returnValue = options.variable ? "$scale-default" : "default";
  } else {
    const uppercasedDirection = UTILS.capitalize(direction);
    returnValue = options.variable ? "$scale-" + numberWord.toLowerCase() + "-" + direction.toLowerCase() : numberWord.toLowerCase() + uppercasedDirection;
  }

  return options.negative ? "-" + returnValue : returnValue;

};

/*
 * @decription - for a given classname and some properties generates all of the sizes.
 * example: .TopSpacer { &.TopSpacer--default { padding-top: $scale-default } } but for every size, so a bunch of classes.
 * @return String
 */
const generateScaledClasses = function (className, properties, prefix) {

  let individualLayoutClasses = [];

  for (let j = 0; j <= DATA.numberOfSizes; j += 1) {

    const positiveKeyPropertyValues = UTILS.objectFromArrays(
      UTILS.toArray(properties),
      UTILS.duplicateArrayValue(getScaleBasedOnNumber(j, "down", { variable: true }), properties.length)
    );

    let positiveLayoutObj = {
      className: className,
      modifier: getScaleBasedOnNumber(j, "up"),
      propertyKeyValues: positiveKeyPropertyValues
    };

    if (typeof prefix !== "undefined" && prefix) {
      positiveLayoutObj.prefix = prefix;
    }

    individualLayoutClasses.push(
      singleLayoutClass(positiveLayoutObj)
    );
  }

  // Starting off at one this time for the "down" sizes so that --default doesn't get
  // generated again.
  for (let j = 1; j <= DATA.numberOfSizes; j += 1) {

    const negativeKeyPropertyValues = UTILS.objectFromArrays(
      UTILS.toArray(properties),
      UTILS.duplicateArrayValue(getScaleBasedOnNumber(j, "down", {variable: true}), properties.length)
    );

    let negativeLayoutObj = {
      className: className,
      modifier: getScaleBasedOnNumber(j, "down"),
      propertyKeyValues: negativeKeyPropertyValues
    };

    if (typeof prefix !== "undefined" && prefix) {
      negativeLayoutObj.prefix = prefix;
    }

    individualLayoutClasses.push(
      singleLayoutClass(negativeLayoutObj)
    );
  }

  return individualLayoutClasses;

};

const generateModifierClasses = function (className, modifiers, prefix) {

  let modifierClasses = [];

  modifiers.forEach(function (modifier) {

    const propertyKeyValues = UTILS.objectFromArrays(UTILS.toArray(modifier.modifierProperty), UTILS.toArray(modifier.modifierValue));

    let singleLayoutObj = {
      className: className,
      modifier: modifier.modifierName,
      propertyKeyValues: propertyKeyValues
    };

    if (typeof modifier.child !== "undefined" && modifier.child) {
      singleLayoutObj.child = modifier.child;
    }

    if (typeof prefix !== "undefined" && prefix) {
      singleLayoutObj.prefix = prefix;
    }

    const modifierClass = singleLayoutClass(singleLayoutObj);

    modifierClasses.push(modifierClass);

  });

  return modifierClasses;

};

/*
 * @description - Generates custom css classes for each color in DATA.COLORS given a className.
 * @example: &.Bold--mediumBlue { color: $40300; }
 * TODO: Right now just immeditely puts the color in there, but would be cool to generate variables first and use that instead of the direct HEX code. */
let generateColorClasses = function (className, isBackgroundColor, prefix) {

  const colorClasses = [];

  for (let i = 0; i < DATA.COLORS.length; i += 1) {

    const customColorName = COLOR_CACHE[DATA.COLORS[i]],
          colorOrBackground = isBackgroundColor ? ["backgroundColor"] : ["color"];

    let singleLayoutObj = {
      className: className,
      modifier: customColorName,
      propertyKeyValues: UTILS.objectFromArrays(colorOrBackground, [DATA.COLORS[i]])
    }

    if (typeof prefix !== "undefined" && prefix) {
      singleLayoutObj.prefix = prefix;
    }

    colorClasses.push(
      singleLayoutClass(singleLayoutObj)
    );
  }

  return colorClasses;
};

/*
 * @description - Generates custom css classes line heights in DATA.LINE_HEIGHTS given a className.
 * @example: &.Bold--lineHeightOneFour{ line-height: 1.4; }
 * TODO: Put variables in there instead. */
const generateLineHeightClasses = function (className, prefix) {

  let classes = [];

  for (let i = 0; i < DATA.LINE_HEIGHTS.length; i += 1) {

    let singleLayoutObj = {
      className: className,
      modifier: "lineHeight" + UTILS.decimalToWord(DATA.LINE_HEIGHTS[i]),
      propertyKeyValues: UTILS.objectFromArrays(["line-height"], [DATA.LINE_HEIGHTS[i]])
    }

    if (typeof prefix !== "undefined" && prefix) {
      singleLayoutObj.prefix = prefix;
    }

    classes.push(
      singleLayoutClass(singleLayoutObj)
    );

  }

  return classes;

};

const generateGridGutterClasses = function (className, prefix) {


  let individualLayoutClasses = [];

  // Step 1. Generate the negative margin classes (positive scale)

  for (let j = 0; j <= DATA.numberOfSizes; j += 1) {

    const positiveKeyPropertyValues = UTILS.objectFromArrays(
      ["margin-left"],
      UTILS.toArray(getScaleBasedOnNumber(j, "up", {
        variable: true,
        negative: true
      }))
    );

    let positiveLayoutObj = {
      className: className,
      modifier: "gutters" + UTILS.capitalize(getScaleBasedOnNumber(j, "up")),
      propertyKeyValues: positiveKeyPropertyValues
    };

    const negativeKeyPropertyValues = UTILS.objectFromArrays(
      ["margin-left"],
      UTILS.toArray(getScaleBasedOnNumber(j, "down", {
        variable: true,
        negative: true
      }))
    );

    let negativeLayoutObj = {
      className: className,
      modifier: "gutters" + UTILS.capitalize(getScaleBasedOnNumber(j, "down")),
      propertyKeyValues: negativeKeyPropertyValues
    };

    // Step 2. Generate the padding classes (positive scale)

    const gridChildPropertyValues = UTILS.objectFromArrays(
      ["padding-left"],
      UTILS.toArray(getScaleBasedOnNumber(j, "up", {
        variable: true
      }))
    );

    let gridChildLayoutObj = {
      className: className,
      child: ".Grid-cell",
      modifier: "gutters" + UTILS.capitalize(getScaleBasedOnNumber(j, "up")),
      propertyKeyValues: gridChildPropertyValues
    };

    const gridChildNegativePropertyValues = UTILS.objectFromArrays(
      ["padding-left"],
      UTILS.toArray(getScaleBasedOnNumber(j, "down", {
        variable: true
      }))
    );

    let gridChildNegativeLayoutObj = {
      className: className,
      child: ".Grid-cell",
      modifier: "gutters" + UTILS.capitalize(getScaleBasedOnNumber(j, "down")),
      propertyKeyValues: gridChildNegativePropertyValues
    };

    if (typeof prefix !== "undefined" && prefix) {
      positiveLayoutObj.prefix = prefix;
      gridChildLayoutObj.prefix = prefix;
      negativeLayoutObj.prefix = prefix;
      gridChildNegativeLayoutObj.prefix = prefix;
    }

    individualLayoutClasses.push(
      singleLayoutClass(positiveLayoutObj),
      singleLayoutClass(gridChildLayoutObj)
    );

    if (j >= 1) {

      individualLayoutClasses.push(
        singleLayoutClass(negativeLayoutObj),
        singleLayoutClass(gridChildNegativeLayoutObj)
      );

    }

  }


  return individualLayoutClasses;

};

const generateGridColumnClasses = function (className, numberOfColumns, prefix) {

  let layoutClasses = [];

  for (let i = 1; i < numberOfColumns; i += 1) {

    const positiveKeyPropertyValues = UTILS.objectFromArrays(
      ["flex"],
      ["0 0 " + getPercentage(i, numberOfColumns) + "%"]
    );

    let layoutObj = {
      className: className,
      modifier: i + "of" + numberOfColumns,
      propertyKeyValues: positiveKeyPropertyValues
    };

    if (typeof prefix !== "undefined" && prefix) {
      layoutObj.prefix = prefix;
    }

    layoutClasses.push(
      singleLayoutClass(layoutObj)
    );

  }

  return layoutClasses;
}

const generatePusherPullerClasses = function (className, numberToMove, options, prefix) {

  options = options || {};

  let layoutClasses = [];

  for (let i = 1; i < numberToMove; i += 1) {

    const propertyToGenerate =

    options.moveOption === "pull" ?
      getScaleBasedOnNumber(i, "up", { variable: true, negative: true}) :
      getScaleBasedOnNumber(i, "up", { variable: true});

    const positiveKeyPropertyValues = UTILS.objectFromArrays(
      ["margin-left"],
      [propertyToGenerate]
    );

    let layoutObj = {
      className: className,
      modifier: options.moveOption + i,
      propertyKeyValues: positiveKeyPropertyValues
    };

    if (typeof prefix !== "undefined" && prefix) {
      layoutObj.prefix = prefix;
    }

    layoutClasses.push(
      singleLayoutClass(layoutObj)
    );

  }

  return layoutClasses;

};

const generateOrderClasses = function (className, numberOfOrders, prefix) {

  let layoutClasses = [];

  for (let i = 1; i <= numberOfOrders; i += 1) {

    const positiveKeyPropertyValues = UTILS.objectFromArrays(
      ["order"],
      [i]
    );

    let layoutObj = {
      className: className,
      modifier: "order" + i,
      propertyKeyValues: positiveKeyPropertyValues
    };

    if (typeof prefix !== "undefined" && prefix) {
      layoutObj.prefix = prefix;
    }

    layoutClasses.push(
      singleLayoutClass(layoutObj)
    );

  }

  return layoutClasses;

};

const generateLayout = function (prefix) {

  let layoutText = "";

  // Need to get the appropriate $scale variable in here and pass that in when creating the
  for (let i = 0; i < DATA.LAYOUT.length; i += 1) {

    let allCombinedClasses = [];

    if ("modifiers" in DATA.LAYOUT[i]) {

      const modifierClasses = generateModifierClasses(DATA.LAYOUT[i].className, DATA.LAYOUT[i].modifiers, prefix);
      allCombinedClasses = allCombinedClasses.concat(modifierClasses);

    }

    if ("scaleProperties" in DATA.LAYOUT[i]) {
      const scaledClasses = generateScaledClasses(DATA.LAYOUT[i].className, DATA.LAYOUT[i].scaleProperties, prefix);
      allCombinedClasses = allCombinedClasses.concat(scaledClasses);
    }

    if ("colors" in DATA.LAYOUT[i]) {
      const colorClasses = generateColorClasses(DATA.LAYOUT[i].className, prefix);
      allCombinedClasses = allCombinedClasses.concat(colorClasses);
    }

    if ("backgroundColors" in DATA.LAYOUT[i]) {
      const backgroundColorClasses = generateColorClasses(DATA.LAYOUT[i].className, true, prefix);
      allCombinedClasses = allCombinedClasses.concat(backgroundColorClasses);
    }

    if ("lineHeights" in DATA.LAYOUT[i]) {
      const lineHeightClasses = generateLineHeightClasses(DATA.LAYOUT[i].className, prefix);
      allCombinedClasses = allCombinedClasses.concat(lineHeightClasses);
    }

    if ("gutters" in DATA.LAYOUT[i]) {
      const gridGutterClasses = generateGridGutterClasses(DATA.LAYOUT[i].className, prefix);
      allCombinedClasses = allCombinedClasses.concat(gridGutterClasses);
    }

    // columns: 8,

    if ("columns" in DATA.LAYOUT[i]) {
      const gridColumnColumns = generateGridColumnClasses(DATA.LAYOUT[i].className, DATA.LAYOUT[i].columns, prefix);
      allCombinedClasses = allCombinedClasses.concat(gridColumnColumns);
    }

    // pushers: true,
    // pullers: true,

    if ("pushers" in DATA.LAYOUT[i]) {
      const pusherClasses = generatePusherPullerClasses(DATA.LAYOUT[i].className, DATA.LAYOUT[i].pushers, {pusher: true}, prefix);
      allCombinedClasses = allCombinedClasses.concat(pusherClasses);
    }

    if ("pullers" in DATA.LAYOUT[i]) {
      const pullerClasses = generatePusherPullerClasses(DATA.LAYOUT[i].className, DATA.LAYOUT[i].pullers, {puller: true}, prefix);
      allCombinedClasses = allCombinedClasses.concat(pullerClasses);
    }

    // order: true

    if ("order" in DATA.LAYOUT[i]) {
      const orderClasses = generateOrderClasses(DATA.LAYOUT[i].className, DATA.LAYOUT[i].order);
      allCombinedClasses = allCombinedClasses.concat(orderClasses);
    }

    if ("defaultProperties" in DATA.LAYOUT[i]) {
      layoutText += allLayoutParts({
        className: DATA.LAYOUT[i].className,
        generatedClasses: allCombinedClasses,
        defaultProperties: DATA.LAYOUT[i].defaultProperties
      });
    } else {
      layoutText += allLayoutParts({
        className: DATA.LAYOUT[i].className,
        generatedClasses: allCombinedClasses
      });
    }

  }

  return layoutText;
};

const generateResponsiveLayout = function (resizePoint) {

  let responsiveLayout = "";

  const resizePointWord = numberConverter.toWords(resizePoint);

  responsiveLayout += generateLayout(resizePointWord);

  return responsiveLayoutShell({
    resizePoint: resizePointWord,
    responsiveGeneratedLayoutClasses: responsiveLayout
  });

};

const generateEntireLayout = function () {
  let result = "";

  result += DATA.VARIABLES + "\n";
  result += variableGenerator(DATA.baseFontSize, DATA.scale, DATA.numberOfSizes) + "\n\n";

  result += generateLayout();
  // Go through each of the sizes and generate the correct classes with the right prefixes for them.


  for (let i = 1; i <= DATA.numberOfResizePoints; i += 1) {
    result += generateResponsiveLayout(i);
  }

  return result;

};

const putGeneratedLayoutIntoFile = function (renderCss) {

  const entireLayout = generateEntireLayout();

  console.log("Generating the classes...");

  fs.writeFile("./_generated.scss", entireLayout, function(err) {
      if(err) {
          return console.log(err);
      }

      if (!err && renderCss) {

        const sass = require('node-sass');

        sass.render({
          file: "./_generated.scss",
          outFile: "./generated.css"
        }, function(err, result) {

          if (!err) {
            fs.writeFile("./generated.css", result.css, function (error) {
              if ( ! error) {
                console.log("No error while generating the CSS!");
              } else {
                console.log("error");
              }
            });
          } else {
            console.log(err);
          }

        });

      }

  });
};


// putGeneratedLayoutIntoFile(true);
