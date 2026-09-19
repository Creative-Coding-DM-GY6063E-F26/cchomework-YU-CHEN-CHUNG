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

  drawItalianFlag(164, 150, 132, 325, 85);
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

function cooltri(x, y, r, g, b, s = 1) {
  noStroke();
  fill(r * 255, g * 255, b * 255);
  triangle(x, y, x + 37 * s, y - 6 * s, x + 18 * s, y + 78 * s);
}
