const uptriflagcolor = [
  [0.967, 0.3, 0.2],
  [0.9, 0.9, 0.9],
  [0.967, 0.3, 0.2],
  [0.967, 0.3, 0.2],
  [0.2, 0.25, 0.45],
  [0.967, 0.3, 0.2],
  [0.967, 0.3, 0.2]
];

function setup() {
  createCanvas(370, 500);
  noLoop();
}

function draw() {
  background(200);

  drawQuietTexture();
  drawItalianFlag(164, 150, 132, 325, 85);
 
  drawSmallSymbols();
  drawCanadianFlag(44, 354, 164, 86);

  const s = 1.4;
  for (let i = 0; i < 7; i++) {
    cooltri(
      40 + 37 * i * s,
      30 - 6 * i * s,
      uptriflagcolor[i][0],
      uptriflagcolor[i][1],
      uptriflagcolor[i][2],
      s
    );
  }

  // Cord passing in front of the flags.
  stroke(35, 45, 39);
  strokeWeight(2);
  line(0, 49, width, -11);
}

function drawThinStructure() {
  stroke(29, 45, 39);
  strokeWeight(2);
  noFill();

  line(0, 202, 211, 202);
  line(72, 189, 211, 189);
  line(67, 249, 211, 249);
  line(30, 470, 342, 470);

  line(29, 83, 35, 470);
  line(76, 72, 77, 470);
  line(29, 101, 77, 72);
  line(30, 250, 77, 189);
  line(31, 341, 76, 250);
  line(34, 420, 76, 341);

  line(132, 76, 132, 470);
  line(143, 91, 143, 470);
  line(132, 119, 206, 79);
  line(143, 256, 205, 223);
  line(143, 310, 203, 309);
  line(143, 391, 203, 371);

  strokeWeight(3);
  line(143, 254, 188, 254);
  line(188, 254, 183, 284);

  strokeWeight(1.5);
  line(249, 72, 370, 165);
  line(251, 102, 370, 79);
  line(249, 132, 370, 207);
  line(264, 90, 307, 142);
  line(307, 142, 370, 119);

  beginShape();
  vertex(113, 88);
  vertex(141, 67);
  vertex(165, 92);
  vertex(185, 72);
  endShape();
}

function drawSmallSymbols() {
  noStroke();
  fill(196, 38, 41);
  triangle(4, 173, 15, 173, 4, 225);
  triangle(17, 173, 27, 173, 17, 215);

  fill(28, 55, 46);
  triangle(171, 70, 198, 91, 171, 98);

}

function drawItalianFlag(x, y, w, h, rise) {
  push();
  noStroke();

  const colors = [[32, 83, 57], [226, 231, 220], [201, 43, 50]];

  // Vertical sides; the top and bottom edges rise toward the right.
  for (let i = 0; i < 3; i++) {
    const leftX = x + w * i / 3;
    const rightX = x + w * (i + 1) / 3;
    const leftY = y - rise * i / 3;
    const rightY = y - rise * (i + 1) / 3;
    fill(...colors[i]);
    quad(leftX, leftY, rightX, rightY,
         rightX, rightY + h, leftX, leftY + h);
  }

  pop();
}

function drawCanadianFlag(x, y, w, h) {
  push();
  noStroke();

  fill(201, 43, 50);
  const redWidth = w * 0.25;
  rect(x, y, redWidth, h);
  rect(x + w - redWidth, y, redWidth, h);

  drawMapleLeaf(x + w / 2, y + h / 2, 0.72);
  pop();
}

function drawMapleLeaf(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(201, 43, 50);
  beginShape();
  vertex(0, -28);
  vertex(7, -15);
  vertex(16, -20);
  vertex(13, -7);
  vertex(27, -9);
  vertex(19, 3);
  vertex(25, 9);
  vertex(8, 11);
  vertex(9, 29);
  vertex(2, 29);
  vertex(2, 12);
  vertex(-15, 16);
  vertex(-11, 7);
  vertex(-24, 1);
  vertex(-14, -4);
  vertex(-18, -16);
  vertex(-6, -12);
  endShape(CLOSE);
  pop();
}

function drawQuietTexture() {
  // Only a little print texture; the busy scribbles are intentionally omitted.
  randomSeed(19);
  stroke(82, 88, 75, 28);
  strokeWeight(1);
  for (let i = 0; i < 55; i++) {
    const x = random(width);
    const y = random(60, 478);
    const len = random(7, 34);
    line(x, y, x + len, y + random(-5, 5));
  }
}

function cooltri(x, y, r, g, b, s = 1) {
  noStroke();
  fill(r * 255, g * 255, b * 255);
  triangle(x, y, x + 37 * s, y - 6 * s, x + 18 * s, y + 78 * s);
}
