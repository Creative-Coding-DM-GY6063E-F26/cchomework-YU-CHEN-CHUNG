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

  drawRearBlueTriangle();
  drawItalianFlag(164, 150, 132, 325, 85);
  drawLowerLeftFlag();
  drawLargeColorShapes();
  drawCanadianFlag(44, 354, 164, 86);
  drawBottomShapes();

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

function drawRearBlueTriangle() {
  push();
  noStroke();
  scale(width / 130, height / 175);
  fill(31, 91, 149);
  // Horizontal triangle behind the Italian flag and the top pennants.
  triangle(88, 31, 136, -3, 136, 26);
  pop();
}

function drawLargeColorShapes() {
  push();
  noStroke();
  // Coordinates follow the 130 × 175 reference image.
  scale(width / 130, height / 175);

  // Broad blue band crossing in front of the Italian flag.
  fill(27, 104, 147);
  quad(0, 76, 130, 80, 130, 85, 0, 82);

  // Equal-sized flags using the original triangle helper.
  // The first flag extends past the left edge of the canvas.
  const sideFlagScale = 0.5;
  const sideFlagColors = [[190, 43, 43], [190, 43, 43], [33, 65, 111]];
  for (let i = 0; i < 3; i++) {
    const c = sideFlagColors[i];
    cooltri(-15 + 37 * i * sideFlagScale,
            71 - 6 * i * sideFlagScale,
            c[0] / 255, c[1] / 255, c[2] / 255, sideFlagScale);
  }

  fill(238, 179, 41);
  quad(0, 64, 18, 63, 18, 73, 0, 74);

  // Blue parallelogram slanting down to the right, partly off canvas.
  fill(24, 111, 151);
  quad(104, 39, 117, 40, 139, 59, 126, 58);

  // Separate black triangle below the parallelogram.
  fill(24, 33, 28);
  triangle(104, 56, 121, 61, 114, 69);

  // Solid dark pennant beneath the top row.
  fill(30, 49, 39);
  triangle(74, 32, 89, 40, 83, 44);
  pop();
}

function drawLowerLeftFlag() {
  push();
  noStroke();
  scale(width / 130, height / 175);

  // One steep parallelogram, split into white and red horizontal halves.
  // Its lower portion extends beyond the canvas, as in the reference.
  const x = 0;
  const y = 106;
  const w = 28;
  const h = 100;
  const rise = 30;

  fill(226, 231, 220);
  quad(x, y, x + w, y - rise,
       x + w, y - rise + h / 2, x, y + h / 2);
  fill(201, 43, 50);
  quad(x, y + h / 2, x + w, y - rise + h / 2,
       x + w, y - rise + h, x, y + h);
  pop();
}

function drawBottomShapes() {
  push();
  noStroke();
  scale(width / 130, height / 175);

  // Two rounded brown forms, with their bases following the rising edge.
  fill(108, 96, 74);
  push();
  translate(83.5, 164);
  rotate(-0.19);
  arc(0, 0, 22, 35, PI, TWO_PI, CHORD);
  pop();

  fill(83, 77, 61);
  push();
  translate(102, 161);
  rotate(-0.17);
  arc(0, 0, 24, 31, PI, TWO_PI, CHORD);
  pop();

  fill(30, 83, 138);
  quad(0, 169, 130, 167, 130, 172, 0, 174);
  pop();
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
  vertex(3, 10);
  vertex(3, 29);
  vertex(-3, 29);
  vertex(-3, 10);
  vertex(-8, 11);
  vertex(-25, 9);
  vertex(-19, 3);
  vertex(-27, -9);
  vertex(-13, -7);
  vertex(-16, -20);
  vertex(-7, -15);
  endShape(CLOSE);
  pop();
}

function cooltri(x, y, r, g, b, s = 1) {
  noStroke();
  fill(r * 255, g * 255, b * 255);
  triangle(x, y, x + 37 * s, y - 6 * s, x + 18 * s, y + 78 * s);
}
