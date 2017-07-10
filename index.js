const Atomizer = require('atomizer');
const colorNamer = require('color-namer');
const fs = require('fs');

let defaultConfig = {
    "breakPoints": {
        'sm': '@media(min-width:750px)',
        'md': '@media(min-width:1000px)',
        'lg': '@media(min-width:1200px)'
    }
};

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

  let output = {};

  output["default"] = "1rem";

  for (let i = 1; i <= numberOfVars; i += 1) {
    output["u" + i] = Math.pow(scale, i) + 'rem'
    output["d" + i] = getDownRemNumber(baseFontSize, scale, i) + "rem"
  }

  return output;
}

defaultConfig.custom = variableGenerator(16, 1.272, 8);

const classesToGenerate = [
  "Fz",
  "Pt",
  "Pb",
  "Pstart",
  "Pend",
  "Mt",
  "Mb",
  "Mstart",
  "Mend",
  "Mw",
  "T",
  "B",
  "Start",
  "End",
  "H"
];

const classesWithPerentages = [
  "W",
  "Mw",
  "Flx"
];

let scaleClasses = [];

const generateScaleClasses = function (suffix) {

  classesToGenerate.forEach(function (klass) {
    for (let i = 1; i <= 8; i += 1) {

      if (suffix) {
        scaleClasses.push(klass + "(u" + i + ")" + "--" + suffix);
        scaleClasses.push(klass + "(d" + i + ")" + "--" + suffix);
      } else {
        scaleClasses.push(klass + "(u" + i + ")");
        scaleClasses.push(klass + "(d" + i + ")");
      }

    }
  });

};

let percentageClasses = [];

const generatePercentageClasses = function (suffix) {

  classesWithPerentages.forEach(function (klass) {
    for (let i = 1; i <= 8; i += 1) {

      if (suffix) {
        percentageClasses.push(klass + "(" + i + "/" + 8 + ")" + "--" + suffix);
      } else {
        percentageClasses.push(klass + "(" + i + "/" + 8 + ")");
      }
    }
  });
};

generateScaleClasses();
generatePercentageClasses();

// for (let size in defaultConfig.breakPoints) {
//
//   generateScaleClasses(size);
//   generatePercentageClasses(size);
// }

// console.log("default config", defaultConfig);

defaultConfig["classNames"] = scaleClasses.concat(percentageClasses);

const atomizer = new Atomizer({verbose: false});

// Step 1, generate all of the custom variables that I need, which are really just scales.

// Generate Atomic CSS from configuration
const SCALE_CSS = atomizer.getCss(defaultConfig);


const COLORS = ['#F19A3E','#2AB8F4','#2192C2','#F5F3F5','#CEC9CF','#1DA1F2','#145F7E','#A22048','#921245','#EE4167','#DC0072','#695E6C','#3F3941', '#3C3C3C','#A31F49','#921144','#4C4C4C','#42ACEE','#0007DC'];

/*
 * @source: https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 */
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

const getCustomColorName = (function () {

  var names = {};

  function getName(colorCode, iterator) {

    const customColorName = camelize(colorNamer(colorCode).ntc[iterator].name);

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

  for (let i = 0; i < COLORS.length; i += 1) {
    colors[COLORS[i]] = getCustomColorName(COLORS[i], 0);
  }

  return colors;

}());

function swap(json){
  var ret = {};
  for(var key in json){
    ret[json[key]] = key;
  }
  return ret;
}

let custom_colors = swap(COLOR_CACHE);
// console.log("custom_colors", custom_colors)

const colorConfig = {
  "custom": custom_colors
}

const classesToGenerateColorsFor = ["Bgc", "C"];

let COLOR_CLASSES = [];

const generateColorClasses = function () {

  classesToGenerateColorsFor.forEach(function (klass) {

    for (let color in colorConfig.custom) {
      COLOR_CLASSES.push(klass + "(" + color + ")");
    }

  });
};


generateColorClasses();

colorConfig["classNames"] = COLOR_CLASSES;

// Generate Atomic CSS from configuration
const COLOR_CSS = atomizer.getCss(colorConfig);

fs.writeFile("./scaleular.css", SCALE_CSS.concat(COLOR_CSS), function(err) {
    if(err) {
        return console.log(err);
    } else {
      console.log("FINISHED");
    }
  });
