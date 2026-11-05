/**
 * 
 * A simple drawing machine that draws circles when the mouse is pressed.
 * 
 */

let colors = ['red', 'blue'];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(220);
}

function draw() {
  noStroke(); 
  let t = map(mouseX+mouseY, 0, width+height, 0, 1);

  let c = lerpColor(color(colors[0]), color(colors[1]), t);
  fill(c);

  if (mouseIsPressed) {
    circle(mouseX, mouseY, width*0.0625);
  }
}

function keyPressed() {
  if (keyCode === 32) { // Check if the spacebar is pressed
    background(220);
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Exercises for you to try :
// 1. Use mouseX or mouseY to change the circle's size or color as you draw.
//    Hint: map(mouseX, 0, width, 5, 100)

