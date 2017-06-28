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

module.exports = {
  baseFontSize: DATA.baseFontSize,
  scale: DATA.scale,
  numberOfResizePoints: DATA.numberOfResizePoints,
  numberOfSizes: DATA.numberOfSizes,
  PURE_LAYOUT: PURE_LAYOUT,
  NON_PURELAYOUT: NONPURE_LAYOUT,
  COLORS: COLORS
};
