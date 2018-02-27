'use strict';

// The smoothing ratio
var smoothing = 0.2;

var center_x = 225;
var center_y = 225;
var min_x = 25;
var max_x = 425;
var min_y = 25;
var max_y = 425;
var levels_x = 5;
var levels_y = 5;
var unit = 40;

//// labels
var dx = 10;
var dy = 10;



//var points = [[1, 4], [-3, 1.5], [-3, 0], [1, -3], [1, 2]];
var points = [[0, 0], [0.6, 2], [1, 5]];
var mapping_points = [];
function mapPoints(pointArray) {
  var retArray = [];
  pointArray.forEach(function(ele, idx) {
    var point = [];
    point[0] = ele[0] * unit + center_x;
    point[1] = -ele[1] * unit + center_y;
    retArray.push(point);
  });
  return retArray;
}

mapping_points = mapPoints(points);
console.log(mapping_points);

// Properties of a line
// I:  - pointA (array) [x,y]: coordinates
//     - pointB (array) [x,y]: coordinates
// O:  - (object) { length: l, angle: a }: properties of the line
var line = function line(pointA, pointB) {
  var lengthX = pointB[0] - pointA[0];
  var lengthY = pointB[1] - pointA[1];
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  };
};

// Position of a control point
// I:  - current (array) [x, y]: current point coordinates
//     - previous (array) [x, y]: previous point coordinates
//     - next (array) [x, y]: next point coordinates
//     - reverse (boolean, optional): sets the direction
// O:  - (array) [x,y]: a tuple of coordinates
var controlPoint = function controlPoint(current, previous, next, reverse) {

  // When 'current' is the first or last point of the array
  // 'previous' or 'next' don't exist.
  // Replace with 'current'
  var p = previous ? previous : current;
  var n = next ? next : current;

  // Properties of the opposed-line
  var o = line(p, n);

  // If is end-control-point, add PI to the angle to go backward
  var angle = o.angle + (reverse ? Math.PI : 0);
  var length = o.length * smoothing;

  // The control point position is relative to the current point
  var x = current[0] + Math.cos(angle) * length;
  var y = current[1] + Math.sin(angle) * length;
  return [x, y];
};

// Create the bezier curve command
// I:  - point (array) [x,y]: current point coordinates
//     - i (integer): index of 'point' in the array 'a'
//     - a (array): complete array of points coordinates
// O:  - (string) 'C x2,y2 x1,y1 x,y': SVG cubic bezier C command
var bezierCommand = function bezierCommand(point, i, a) {

  // start control point
  var cps = controlPoint(a[i - 1], a[i - 2], point);

  // end control point
  var cpe = controlPoint(point, a[i - 1], a[i + 1], true);
  return 'C ' + cps[0] + ',' + cps[1] + ' ' + cpe[0] + ',' + cpe[1] + ' ' + point[0] + ',' + point[1];
};

// Render the svg <path> element
// I:  - points (array): points coordinates
//     - command (function)
//       I:  - point (array) [x,y]: current point coordinates
//           - i (integer): index of 'point' in the array 'a'
//           - a (array): complete array of points coordinates
//       O:  - (string) a svg path command
// O:  - (string): a Svg <path> element
var svgPath = function svgPath(points, command) {
  // build the d attributes by looping over the points
  var d = points.reduce(function (acc, point, i, a) {
    return i === 0 ? 'M ' + point[0] + ',' + point[1] : acc + ' ' + command(point, i, a);
  }, '');
  return '<path d="' + d + '" fill="none" stroke="grey" />';
};

var svg = document.querySelector('.svg');

// pointsHtml += '<circle cx="5" cy="10" r="0.5" fill="red" />';
// pointsHtml += '<circle cx="10" cy="40" r="0.5" fill="red" />';
// pointsHtml += '<circle cx="40" cy="30" r="0.5" fill="red" />';
// pointsHtml += '<circle cx="60" cy="5" r="0.5" fill="red" />';
// pointsHtml += '<circle cx="90" cy="45" r="0.5" fill="red" />';
function drawPoints() {
  var pointsHtml ="";
  // var points = [[5, 10], [10, 40], [40, 30], [60, 5], [90, 45]];
  points.forEach(function(elem, idx) {
    var x = elem[0];
    var y = -elem[1];
    pointsHtml += '<circle cx="'+ (center_x + x * unit) + '" cy="' + (center_y + y * unit) + '" r="2" fill="red" />';
  })  
  console.log(pointsHtml);
  return pointsHtml;
}

svg.innerHTML = drawAxis() + svgPath(mapping_points, bezierCommand) + drawPoints() + drawLabels();

function drawAxis() {
  var axisHtml = ""; 

  //// ref axis
  axisHtml += '<line x1="0" y1="' + center_y + '" x2="450" y2="'+ center_y + '" class="mainAxis"/>';
  axisHtml += '<line x1="' + center_x + '" y1="0" x2="' + center_x + '" y2="450" class="mainAxis"/>';
  for(var i = 1; i <= levels_x; i++) {
    
    axisHtml += '<line x1="' + (center_x - i * unit) + '" y1="' + min_y + '" x2="' + (center_x - i * unit) + '" y2="' + max_y + '" class="subAxis"/>';
    axisHtml += '<line x1="' + (center_x + i * unit) + '" y1="' + min_y + '" x2="' + (center_x + i * unit) + '" y2="' + max_y + '" class="subAxis"/>';

  }

  for(var i = 1; i <= levels_y; i++) {
    
    axisHtml += '<line x1="' + min_x + '" y1="' + (center_y - i * unit) + '" x2="' + max_x + '" y2="' + (center_y - i * unit) + '" class="subAxis"/>';
    axisHtml += '<line x1="' + min_x + '" y1="' + (center_y + i * unit) + '" x2="' + max_x + '" y2="' + (center_y + i * unit) + '" class="subAxis"/>';    

  }

  return axisHtml;
}


function drawLabels() {
  // <text x="0" y="15" fill="red">I love SVG!</text>
  var labelsHtml = "";
  for(var i = 1; i <= levels_x; i++) {
    
    labelsHtml += '<text x="' + (center_x + i * unit) + '" y="' + center_y + '" class="axisLabel">' + i + '</text>';
    labelsHtml += '<text x="' + (center_x - i * unit) + '" y="' + center_y + '" class="axisLabel">' + -(i) + '</text>';

  }

  for(var i = 1; i <= levels_y; i++) {
    
    labelsHtml += '<text x="' + center_x + '" y="' + (center_y + i * unit) + '" class="axisLabel">' + i + '</text>';
    labelsHtml += '<text x="' + center_x + '" y="' + (center_y - i * unit) + '" class="axisLabel">' + -(i) + '</text>';

  }

  return labelsHtml;

}
