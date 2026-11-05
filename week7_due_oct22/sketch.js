/*
 * p5.mapper
 * https://github.com/jdeboi/p5.mapper
 *
 * Jenna deBoisblanc
 * jdeboi.com
 *
 */

let pMapper; // variable to store pMapper object (projection mapping library)
let quadLeft, quadRight, quadTop; // my quad surfaces
let leftImage;
let imageLoadFailed = false;
const ant = {x: 200, y: 200, angle: 0, step: 0};
const antKeys = new Set();

function updateAnt() {
  const dx = Number(antKeys.has("arrowright")) - Number(antKeys.has("arrowleft"));
  const dy = Number(antKeys.has("arrowdown")) - Number(antKeys.has("arrowup"));
  const length = Math.hypot(dx, dy);
  if (!length) return;
  const distance = 150 * Math.min(deltaTime / 1000, 0.05);
  ant.x = Math.max(32, Math.min(768, ant.x + dx / length * distance));
  ant.y = Math.max(70, Math.min(368, ant.y + dy / length * distance));
  ant.angle = Math.atan2(dy, dx);
  ant.step += distance * 0.2;
}

function drawAnt(pg, offset) {
  pg.push();
  pg.ellipseMode(CENTER);
  pg.rectMode(CORNER);
  pg.translate(ant.x - offset, ant.y);
  // Rotate coordinates explicitly so global angleMode cannot affect the ant.
  const c = Math.cos(ant.angle), s = Math.sin(ant.angle);
  pg.applyMatrix(c, s, -s, c, 0, 0);
  pg.stroke(255, 225, 164);
  pg.strokeWeight(5);
  pg.strokeCap(ROUND);
  for (let side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x = -9 + i * 9;
      const swing = Math.sin(ant.step + i * Math.PI + (side > 0 ? Math.PI : 0)) * 5;
      pg.line(x, side * 5, x - 7 + swing, side * 17);
      pg.line(x - 7 + swing, side * 17, x + 2 + swing, side * 25);
    }
  }
  pg.stroke(39, 22, 18);
  pg.strokeWeight(3);
  pg.fill(118, 46, 31);
  pg.ellipse(-18, 0, 27, 21);
  pg.fill(163, 64, 37);
  pg.ellipse(1, 0, 19, 15);
  pg.fill(204, 91, 44);
  pg.ellipse(19, 0, 22, 21);
  pg.line(25, -6, 35, -15);
  pg.line(35, -15, 41, -12);
  pg.line(25, 6, 35, 15);
  pg.line(35, 15, 41, 12);
  pg.noStroke();
  pg.fill(255);
  pg.ellipse(23, -5, 6, 6);
  pg.ellipse(23, 5, 6, 6);
  pg.fill(20);
  pg.ellipse(25, -5, 3, 3);
  pg.ellipse(25, 5, 3, 3);
  pg.pop();

  pg.push();
  pg.rectMode(CORNER);
  pg.noStroke();
  pg.fill(15, 22, 32, 210);
  pg.rect(8, 8, 384, 35, 6);
  pg.fill(255);
  pg.textSize(14);
  pg.textAlign(CENTER, CENTER);
  pg.text("ARROW KEYS: MOVE ANT  |  R: RESET", 200, 25);
  pg.pop();
}

window.addEventListener("blur", () => antKeys.clear());

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  loadImage("aaa.jpg", (img) => {
    leftImage = img;
  }, (error) => {
    imageLoadFailed = true;
    console.error("Could not load aaa.jpg", error);
  });

  // create mapper object
  pMapper = createProjectionMapper(this);

  // create "quads" for each surface of your projection
  quadLeft = pMapper.createQuadMap(400, 400, 20, 20); // 20x20 mesh matches map.json. quads should be proportionate to the physical object you are projecting onto
  quadRight = pMapper.createQuadMap(400, 400, 20, 20);
  quadTop = pMapper.createQuadMap(400, 400, 20, 20);

  // Load saved calibration after all three surfaces have been created.
  pMapper.load("map.json");
}

function draw() {
  background(0);

  updateAnt();

  // display each of the projection surfaces in draw
  quadLeft.displaySketch(mySketch);
  quadRight.displaySketch(myOtherSketch);
  quadTop.displaySketch(myTopSketch);
}
function myTopSketch(pg){
  pg.clear();
  pg.push();
  // your mini sketch goes here!
  
  pg.background(255,10,100);
  pg.textAlign(CENTER,CENTER);
  pg.textSize(70);
  pg.text('We love u!',200,175);
  pg.rectMode(CORNERS);  
  // and ends here!
  pg.pop();
}


function mySketch(pg){ // "pg" refers to each canvas "instance"
  pg.clear();
  pg.push();
  pg.background(0);
  if (leftImage) {
    const imageScale = 0.7; // Smaller values make the image smaller.
    const fit = Math.min(400 / leftImage.width, 400 / leftImage.height);
    pg.imageMode(CENTER);
    pg.image(leftImage, 200, 200,
      leftImage.width * fit * imageScale, leftImage.height * fit * imageScale);
  } else {
    pg.fill(255);
    pg.textAlign(CENTER, CENTER);
    pg.textSize(24);
    pg.text(imageLoadFailed ? "Image failed to load" : "Loading image...", 200, 200);
  }
  pg.pop();
  drawAnt(pg, 0);
}

function myOtherSketch(pg) {
  pg.clear();
  pg.push();
  pg.background(18, 24, 38);
  pg.translate(200, 200);
  pg.ellipseMode(CENTER);

  // Clock face and rim.
  pg.fill(248, 244, 232);
  pg.stroke(225, 179, 92);
  pg.strokeWeight(8);
  pg.ellipse(0, 0, 360, 360);

  // Sixty ticks, with a longer mark every five minutes.
  for (let i = 0; i < 60; i++) {
    const angle = i * Math.PI / 30 - Math.PI / 2;
    const innerRadius = i % 5 === 0 ? 146 : 158;
    pg.stroke(35, 43, 57);
    pg.strokeWeight(i % 5 === 0 ? 4 : 1.5);
    pg.line(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius,
      Math.cos(angle) * 168, Math.sin(angle) * 168);
  }

  pg.noStroke();
  pg.fill(35, 43, 57);
  pg.textAlign(CENTER, CENTER);
  pg.textSize(25);
  for (let number = 1; number <= 12; number++) {
    const angle = number * Math.PI / 6 - Math.PI / 2;
    pg.text(number, Math.cos(angle) * 125, Math.sin(angle) * 125);
  }

  const now = new Date();
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = now.getHours() % 12 + minutes / 60;

  // Hands use radians directly, independent of p5's angleMode.
  const drawHand = (value, total, length, weight, handColor, tail = 0) => {
    const angle = value / total * Math.PI * 2 - Math.PI / 2;
    pg.stroke(handColor);
    pg.strokeWeight(weight);
    pg.strokeCap(ROUND);
    pg.line(-Math.cos(angle) * tail, -Math.sin(angle) * tail,
      Math.cos(angle) * length, Math.sin(angle) * length);
  };
  drawHand(hours, 12, 80, 10, "#232b39");
  drawHand(minutes, 60, 115, 6, "#232b39");
  drawHand(seconds, 60, 143, 2, "#e34b4b", 25);

  pg.noStroke();
  pg.fill(225, 179, 92);
  pg.ellipse(0, 0, 17, 17);
  pg.fill(227, 75, 75);
  pg.ellipse(0, 0, 7, 7);
  pg.pop();
  drawAnt(pg, 400);
}

function keyPressed() { // keypressed toggles different modes
  const pressed = key.toLowerCase();
  if (pressed.startsWith("arrow")) {
    antKeys.add(pressed);
    return false;
  }
  if (pressed === "r") {
    ant.x = 200;
    ant.y = 200;
    ant.angle = 0;
    ant.step = 0;
  }
  switch (pressed) {
    case "c":
      pMapper.toggleCalibration();
      break;
    case "f":
      let fs = fullscreen();
      fullscreen(!fs);
      break;
    case "l":
      pMapper.load("map.json");
      break;

    case "s":
      pMapper.save("map.json");
      break;
  }
}

function keyReleased() {
  antKeys.delete(key.toLowerCase());
  if (key.toLowerCase().startsWith("arrow")) return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
