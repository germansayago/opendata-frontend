
$('.count').each(function () {
  $(this).prop('Counter',0).animate({
      Counter: $(this).text()
  }, {
      duration: 1000,
      easing: 'swing',
      step: function (now) {
          $(this).text(Math.ceil(now));
      }
  });
});

// æ
// lines animation
// this works by
// creating points on a canvas
// and moving them in the same direction bouncing against the sides
// if the points are within the catchment radius of the mouse
// (initially set as the center of the canvas)
// lines will be drawn from the points within the radius
// to all other points within a set distance from that point
var æ = {
canvas: null,
context: null,

// classes for elements for css use
class: 'ani-cx',
parentClass: 'ani-cx--parent',

// speed of animation (higher number = faster)
speed: 2,

// toggle for creating css in javascript
// if no access to styles
doCSS: true,

stroke: {
width: 0.1,
color: 'rgba(255, 255, 255, 0.2)'
},

// will be populated with the dimensions of the canvas
dim: {
width: 0,
height: 0
},

// position of mouse
// initially set as the middle of the canvas
mouse: {
x: 0,
y: 0,
radius: 100
},

draw: {
// @function line
// draws a line on the canvas between two points
// @param {number} _fromX the x position of the first point
// @param {number} _fromY the y position of the first point
// @param {number} _toX the x position of the second point
// @param {number} _toY the y position of the second point
line: function(_fromX, _fromY, _toX, _toY) {
  æ.context.beginPath();
  æ.context.moveTo(_fromX, _fromY);
  æ.context.lineTo(_toX, _toY);
  æ.context.lineWidth = æ.stroke.width;
  æ.context.strokeStyle = æ.stroke.color;
  æ.context.stroke();
  æ.context.closePath();
},

// @function dot
// draws a dot (filled circle) on the canvas
// @param {object} _point the point to draw
dot: function(_point) {
  æ.context.beginPath();
  æ.context.arc(_point.x, _point.y, æ.points.size, 0, Math.PI * 2, true);
  æ.context.closePath();
  æ.context.fillStyle = æ.points.color;
  æ.context.fill();
},
},

// @function clear
// clears the canvas for redraw
clear: function() {
æ.context.clearRect(0, 0, æ.canvas.width, æ.canvas.height);
},

// @function resize
// resizes canvas to size of parent element
// using dimensions set in create function
// called by create()
resize: function() {
  æ.canvas.width = æ.dim.width;
  æ.canvas.height = æ.dim.height;
},

// @function rnd
// returns a random number between two entities
// @param {number} _from the bottom number in the range
// @param {number} _to the top number in the range
// @returns {number}
rnd: function(_from, _to) {
return (Math.random() * (_to - _from)) + _from;
},

// @function create
// creates the canvas element
// adds classes dimensions and styles
// add initial mouse position
// appends to parent element
// @param {string} _parentSelector the query selector string to select the parent element
create: function(_parentSelector) {
var parent = document.querySelector(_parentSelector);

// æ.canvas = document.createElement('canvas');
// canvas is created in init function as part of the support check

// if doCSS is true
// javascript should create all required css inline
// else add classes to the relevant elements
// so they can be styled via css
if (æ.doCSS) {
  æ.writeCSS(_parentSelector);
} else {
  æ.canvas.classList.add(æ.class);
  parent.classList.add(æ.parentClass);
}

// get context for drawing
æ.context = æ.canvas.getContext('2d');

// set dimension variables
// as they are also used to create points
æ.dim.width = parent.offsetWidth;
æ.dim.height = parent.offsetHeight;

// set initial mouse position as center of canvas
æ.mouse.x = parent.offsetWidth / 2;
æ.mouse.y = parent.offsetHeight / 2;

parent.appendChild(æ.canvas);

// resize the canvas to fit parent element
æ.resize();
},

// @function write css
// adds inline css if æ.doCSS is true
// add all css required to make the canvas work
// as a background
// @param {string} _parentSelector the query selector for the parent element
// called by create()
writeCSS: function(_parentSelector) {
var parent = document.querySelector(_parentSelector);
var children = document.querySelectorAll(_parentSelector + " > *");
var position = window.getComputedStyle(parent).position;

// if element does not have a position add it
if (position === "static") {
  parent.style.position = "relative";
}

for (var i = 0; i < children.length; i++) {
  var position = window.getComputedStyle(children[i]).position;
  var zIndex = window.getComputedStyle(children[i]).zIndex;
  var tagName = children[i].tagName.toLowerCase();

  if (position === "static") {
    children[i].style.position = "relative";
  }

  // if element does not have a z-index
  // or z-index is to low add/promote it
  if (zIndex === "auto" || zIndex < 2) {
    children[i].style.zIndex = "2";
  }

  // if it is not an interactive element
  // remove pointer-events so mouse can interact
  // with lines animation
  if (tagName !== "a" && tagName !== "input" && tagName !== "button") {
    children[i].style.pointerEvents = "none";
  }
}

æ.canvas.style.cssText =
  "margin: 0; padding: 0; position: absolute; top: 0; left: 0; z-index: 0;";
},

// @function animate
// calls the functions required for animation and drawing
// and requests new animation frame
animate: function() {
æ.clear();
æ.points.move();
if (æ.points.show) {
  æ.points.plot();
}
æ.points.connect();
requestAnimationFrame(æ.animate);
},

points: {
// amount of points on canvas
amount: 24,

// maximum distance allowed between points
// that will be connected by lines
distance: 100,

// diameter of point
size: 1,

color: 'rgba(255, 255, 255, 0.1)',

// toggle for showing points on canvas
// this will show all points regardless of whether they are connected or not
show: false,

// toggle for showing connected points
// this will only show the points that are connected with lines
showConnected: true,

// this will contain all the points
array: [],

// @function create
// creates a new point with properties
create: function() {
  var speed = æ.speed / 10;

  return (point = {
    // position of point
    x: æ.rnd(0, æ.dim.width),
    y: æ.rnd(0, æ.dim.height),

    // direction of travel
    dirX: æ.rnd(-speed, speed),
    dirY: æ.rnd(-speed, speed)
  });
},

// @function populate array
// loops through amount
// creates points and pushes them to array
populateArray: function() {
  for (var i = 0; i < æ.points.amount; i++) {
    æ.points.array.push(æ.points.create());
  }
  console.log(æ.points.amount);
},

// @function plot
// loops though points array
// and calls the draw function for each point
plot: function() {
  for (var i = 0; i < æ.points.array.length; i++) {
    var point = æ.points.array[i];
    æ.draw.dot(point);
  }
},

// @function connect
// loops through points array
// compares points to each other
// if they are within the catchment radius of the mouse pointer
// and if they are within the allowed distance of each other
// they will be connected by a line
connect: function() {
  var distance = æ.points.distance;
  var radius = æ.mouse.radius;

  for (var i = 0; i < æ.points.amount; i++) {
    for (var j = 0; j < æ.points.amount; j++) {
      var pointI = æ.points.array[i];
      var pointJ = æ.points.array[j];

      if (
        (æ.mouse.x - radius) < pointI.x &&
        (æ.mouse.x + radius) > pointI.x &&
        (æ.mouse.y - radius) < pointI.y &&
        (æ.mouse.y + radius) > pointI.y &&
        (pointJ.x - distance) < pointI.x &&
        (pointJ.x + distance) > pointI.x &&
        (pointJ.y - distance) < pointI.y &&
        (pointJ.y + distance) > pointI.y
      ) {
        æ.draw.line(pointI.x, pointI.y, pointJ.x, pointJ.y);

        // if requested draw connected points
        if (!æ.points.show && æ.points.showConnected) {
          æ.draw.dot(pointI);
          æ.draw.dot(pointJ);
        }
      }
    }
  }
},

// @function move
// moves points across canvas according to their direction
// if point is outside of canvas directional variable is inverted
move: function() {
  for (var i = 0; i < æ.points.amount; i++) {
    var x = æ.points.array[i].x;
    var y = æ.points.array[i].y;

    if (x < 0 || x > æ.dim.width) {
      æ.points.array[i].dirX *= -1;
    }
    if (y < 0 || y > æ.dim.height) {
      æ.points.array[i].dirY *= -1;
    }

    æ.points.array[i].x += æ.points.array[i].dirX;
    æ.points.array[i].y += æ.points.array[i].dirY;
  }
}
},

// @function init
// checks if canvas is supported then
// calls the functions required to
// create and append canvas
// create points
// start animation
// add event listener for mouse
// @param {string} _parentSelector the query selector string for the parent element
init: function(_parentSelector) {
console.clear();
æ.canvas = document.createElement('canvas');
if (æ.canvas.getContext) {
  æ.create(_parentSelector),
  æ.points.populateArray();
  æ.animate();
  æ.canvas.addEventListener('mousemove', function(_event) {
    æ.mouse.x = _event.pageX - æ.canvas.getBoundingClientRect().left;
    æ.mouse.y = _event.pageY - æ.canvas.getBoundingClientRect().top;
  }, false);
}
}
};

// GO GO GOOOO!!!
æ.init('.parent');
