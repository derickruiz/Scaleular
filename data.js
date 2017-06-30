const DATA = {
  baseFontSize: 16,
  scale: 1.272,
  numberOfResizePoints: 6,
  numberOfSizes: 8
};

const VARIABLES = `
  $resizePoint-one: "(min-width: 22.625em)";
  $resizePoint-two: "(min-width: 25em)";
  $resizePoint-three: "(min-width: 31.875em)";
  $resizePoint-four: "(min-width: 42.5em)";
  $resizePoint-five: "(min-width: 50em)";
  $resizePoint-six: "(min-width: 62.5em)";
  $fontFamily-text:   Arial, sans-serif;
  $fontFamily-boldText:   Arial, sans-serif;
  $fontFamily-italicText: Arial, sans-serif;
  $fontFamily-condensedText: Arial, sans-serif;
  $fontFamily-lightText: Arial, sans-serif;
`;

const LINE_HEIGHTS = ["1", "1.2", "1.25", "1.3", "1.5", "1.618", "2"];
const COLORS = ['#F19A3E','#2AB8F4','#2192C2','#F5F3F5','#CEC9CF','#1DA1F2','#145F7E','#A22048','#921245','#EE4167','#DC0072','#695E6C','#3F3941', '#3C3C3C','#A31F49','#921144','#4C4C4C','#42ACEE','#0007DC'];

const LAYOUT = [

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
      },
      {
        modifierName:     "full",
        modifierProperty: "flex",
        child: ".Grid-cell",
        modifierValue:    "0 0 100%"
      },
    ],
    gutters: true
  },

  // Background (with colors)
  {
    className: "Background",
    backgroundColors: true
  },

  {
    className: "Text",
    defaultProperties: {
      "font-family": "$fontFamily-text",
      "font-weight": "normal",
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale"
    },
    scaleProperties: ["font-size"],
    colors: true,
    lineHeights: true
  },

  {
    className: "VerticalConstrainer",
    modifiers: [{
      modifierName: "topNoSpace",
      modifierProperty: "padding-top",
      modifierValue: "0"
    },
    {
      modifierName: "bottomNoSpace",
      modifierProperty: "padding-bottom",
      modifierValue: "0"
    }],
    scaleProperties: ["padding-top", "padding-bottom"]
  },

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
    scaleProperties: ["max-width"]
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
    colors: true,
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
    colors: true,
    lineHeights: true
  },
  // Light (font)
  {
    className: "Light",
    defaultProperties: {
      "font-family": "$fontFamily-lightText",
      "font-weight": "normal",
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale"
    },
    scaleProperties: ["font-size"],
    colors: true,
    lineHeights: true
  },

  {
    className: "Grid-cell",
    defaultProperties: {
      "flex": "1",
    },
    modifiers: [
      {
        modifierName:     "flex",
        modifierProperty: "display",
        modifierValue:    "flex"
      },
      {
        modifierName:     "autoSize",
        modifierProperty: "flex",
        modifierValue:    "none"
      },
      {
        modifierName: "auto",
        modifierProperty: "flex",
        modifierValue: "auto"
      },
      {
        modifierName:     "pushRight",
        modifierProperty: "margin-left",
        modifierValue:    "auto"
      },
      {
        modifierName:     "alignLeft",
        modifierProperty: "align-self",
        modifierValue: "flex-start"
      },
      {
        modifierName:     "alignCenter",
        modifierProperty: "align-self",
        modifierValue: "center"
      },
      {
        modifierName:     "alignBottom",
        modifierProperty: "align-self",
        modifierValue:   "flex-end"
      },
      {
        modifierName: "relative",
        modifierProperty: "position",
        modifierValue: "relative"
      },
      {
        modifierName:     "alignEnd",
        modifierProperty: "justify-content",
        modifierValue:   "flex-end"
      },
    ],
    columns: DATA.numberOfSizes,
    pushers: DATA.numberOfSizes,
    pullers: DATA.numberOfSizes,
    order: DATA.numberOfSizes
  },

  {
    className: "HorizontalConstrainer",
    modifiers: [{
      modifierName:     "leftNoSpace",
      modifierProperty: "padding-left",
      modifierValue:   "0"
    },
    {
      modifierName:     "rightNoSpace",
      modifierProperty: "padding-right",
      modifierValue:   "0"
    }],
    scaleProperties: ["padding-left", "padding-right"]
  },

  // TopPositioner

  {
    className: "TopPositioner",
    modifiers: [{
      modifierName: "absolute",
      modifierProperty: "position",
      modifierValue: "absolute"
    },
    {
      modifierName: "relative",
      modifierProperty: "position",
      modifierValue: "relative"
    }],
    scaleProperties: ["top"]
  },

  // BottomPositioner
  {
    className: "BottomPositioner",
    modifiers: [{
      modifierName: "absolute",
      modifierProperty: "position",
      modifierValue: "absolute"
    },
    {
      modifierName: "relative",
      modifierProperty: "position",
      modifierValue: "relative"
    }],
    scaleProperties: ["bottom"]
  },

  // Flex

  {
    className: "Flex",
    defaultProperties: {
      "display": "flex"
    },
    modifiers: [{
      modifierName: "full",
      modifierProperty: "flex",
      modifierValue: "0 0 100%"
    },
    {
      modifierName: "center",
      modifierProperty: ["flex-direction", "justify-content"],
      modifierValue: ["column", "center"]
    }],
  },

  // FlexItem

  {
    className: "FlexItem",
    modifiers: [{
      modifierName: "alignCenter",
      modifierProperty: "align-self",
      modifierValue: "center"
    }]
  },

  // Cursor
  {
    className: "Cursor",
    modifiers: [{
      modifierName: "pointer",
      modifierProperty: "cursor",
      moifierValue: "pointer"
    }]
  },

  {
    className: "TopSpacer",
    modifiers: [{
      modifierName: "reset",
      modifierProperty: "padding-top",
      modifierValue: "0"
    }],
    scaleProperties: ["padding-top"]
  },
  {
    className: "BottomSpacer",
    modifiers: [{
      modifierName: "reset",
      modifierProperty: "padding-bottom",
      modifierValue: "0"
    }],
    scaleProperties: ["padding-bottom"]
  },
  {
    className: "RightSpacer",
    modifiers: [{
      modifierName: "reset",
      modifierProperty: "margin-right",
      modifierValue: "0"
    }],
    scaleProperties: ["margin-right"]
  },
  {
    className: "LeftSpacer",
    modifiers: [{
      modifierName: "reset",
      modifierProperty: "margin-left",
      modifierValue: "0"
    }],
    scaleProperties: ["margin-left"]
  },
  {
    className: "VerticalStopper",
    scaleProperties: ["height"]
  }];

module.exports = {
  baseFontSize: DATA.baseFontSize,
  scale: DATA.scale,
  numberOfResizePoints: DATA.numberOfResizePoints,
  numberOfSizes: DATA.numberOfSizes,
  LAYOUT: LAYOUT,
  COLORS: COLORS,
  LINE_HEIGHTS: LINE_HEIGHTS,
  VARIABLES: VARIABLES
};
