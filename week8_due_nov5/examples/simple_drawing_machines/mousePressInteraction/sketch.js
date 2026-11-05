/**
 * 
 * A simple drawing machine that draws circles when the mouse is pressed.
 * 
 */
<<<<<<< HEAD

let colors = ['red', 'blue'];

=======
>>>>>>> 7e7be2cd02fd180bdc434853c118882ab06d2a9d
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(220);
}

function draw() {
  noStroke(); 
<<<<<<< HEAD
  let t = map(mouseX+mouseY, 0, width+height, 0, 1);

  let c = lerpColor(color(colors[0]), color(colors[1]), t);
  fill(c);
=======
  fill('peachpuff');
>>>>>>> 7e7be2cd02fd180bdc434853c118882ab06d2a9d

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

