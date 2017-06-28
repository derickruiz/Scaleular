# Scaleular
Dynamically generate CSS classes to create layouts based on a scale.

# How do I use it?

1. Git clone this repo.
2. Inside of the repo directory run `php scaleular.php <Base Font Size> <Scale>` (example: `php scaleular.php 16 1.272`);

# What will it generate?


A `_layout.scss` file that has a bunch of useful classes for styling your web pages.
A `_variables.scss` file that has all of the variables that `_layout` needs.

# How do I use it?

Create divs and start adding these classes to them to style your web pages visually.
Here's an example of a Responsive Blog Post on Codepen: https://codepen.io/derickruiz/pen/vZyVLy

See `_layout.scss` for an example of the classes it generates.
See `_variables.scss` for an example of the variables.
