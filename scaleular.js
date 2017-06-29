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
const getScaleBasedOnNumber = function(number, direction, returnVariable) {

  const numberWord = numberConverter.toWords(number).replace(/ /g,'');

  if (number === 0) {
    return returnVariable ? "$scale-default" : "default";
  } else {
    const uppercasedDirection = UTILS.capitalize(direction);
    return returnVariable ? "$scale-" + numberWord.toLowerCase() + "-" + direction.toLowerCase() : numberWord.toLowerCase() + uppercasedDirection;

  }
};

/*
 * @decription - for a given classname and some properties generates all of the sizes.
 * example: .TopSpacer { &.TopSpacer--default { padding-top: $scale-default } } but for every size, so a bunch of classes.
 * @return String
 */
const generateScaledClasses = function (className, properties, prefix) {

  let individualLayoutClasses = [];

  console.log("generateScaledClasses");

  for (let j = 0; j <= DATA.numberOfSizes; j += 1) {

    const positiveKeyPropertyValues = UTILS.objectFromArrays(
      UTILS.toArray(properties),
      UTILS.duplicateArrayValue(getScaleBasedOnNumber(j, "down", true), properties.length)
    );

    console.log("positiveKeyPropertyValues", positiveKeyPropertyValues);

    let positiveLayoutObj = {
      className: className,
      modifier: getScaleBasedOnNumber(j, "up", false),
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
      UTILS.duplicateArrayValue(getScaleBasedOnNumber(j, "down", true), properties.length)
    );

    let negativeLayoutObj = {
      className: className,
      modifier: getScaleBasedOnNumber(j, "down", false),
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
const generateColorClasses = function (className, isBackgroundColor, prefix) {

  const colorClasses = [];

  for (let i = 0; i < DATA.COLORS.length; i += 1) {

    const customColorName = UTILS.camelize(colorNamer(DATA.COLORS[i]).ntc[0].name),
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
      properties: ["line-height"],
      propertyValue: DATA.LINE_HEIGHTS[i]
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

const generateGridClasses = function () {
  // &.Grid--full > .Grid-cell { flex: 0 0 100%; }
  // &.Grid--gutters {
  //   margin-left: -$scale-default;
  // }
  //
  // &.Grid--gutters > .Grid-cell {
  //   padding-left: $scale-default;
  // }
  //
  // &.Grid--guttersFourDown {
  //   margin-left: -$scale-four-down;
  // }
  //
  // &.Grid--guttersFourDown > .Grid-cell {
  //   padding-left: $scale-four-down;
  // }
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

    if ("grid" in DATA.LAYOUT[i]) {
      // const gridClasses = generateGridClasses();
      // const gridCellClasses = generateGridCellClasses();
      // allCombinedClasses = allCombinedClasses.concat(lineHeightClasses);
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

// console.log("generateModifierClasses");
// console.log(generateModifierClasses(DATA.LAYOUT[0].className, DATA.LAYOUT[0].modifiers));

// console.log("generateScaledClasses");
// console.log(generateScaledClasses(DATA.LAYOUT[2].className, DATA.LAYOUT[2].scaleProperties));

console.log("generateColorClasses (background)");
console.log(generateColorClasses(DATA.LAYOUT[0].className, true));

console.log("generateColorClasses (color)");
console.log(generateColorClasses(DATA.LAYOUT[1].className, false));
