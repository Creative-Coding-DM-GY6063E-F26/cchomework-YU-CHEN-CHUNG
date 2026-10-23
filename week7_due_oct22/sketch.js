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
}

function keyPressed() { // keypressed toggles different modes
  switch (key) {
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
