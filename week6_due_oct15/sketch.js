function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  // hour() sets the position in the real 24-hour daylight/night cycle.
  let h = hour();
  // minute() gradually adjusts the daylight proportion between hours.
  let m = minute();
  // second() drives the daylight proportion and the subtle horizon wave.
  let s = second() + new Date().getMilliseconds() / 1000;
  let timeInSeconds = h * 3600 + m * 60 + s;
  let dayProgress = timeInSeconds / 86400;

  // 2% daylight at midnight, 50% at 06:00/18:00, and 98% at noon.
  let daylight = 0.5 - 0.48 * cos(dayProgress * TWO_PI);
  let boundary = width * daylight;
  let amplitude = width * 0.005;
  let wavePhase = timeInSeconds * TWO_PI / 120;

  background('#080F1C');
  fill('#287BC1');

  // Day on the left, night on the right: the boundary moves horizontally.
  beginShape();
  vertex(0, 0);
  for (let y = 0; y <= height; y += 1) {
    let position = y / height * TWO_PI;
    let wave = sin(position + wavePhase)
      + 0.3 * sin(position * 2 - wavePhase);
    vertex(boundary + wave * amplitude, y);
  }
  vertex(0, height);
  endShape(CLOSE);

  // Each symbol stays centered in its region and shrinks as it disappears.
  let symbolSize = min(width, height) * 0.085;
  let sunSize = min(symbolSize, boundary * 0.35);
  let moonSize = min(symbolSize, (width - boundary) * 0.35);
  let skyY = height * 0.3;

  fill('#FFE5A0');
  circle(boundary / 2, skyY, sunSize);

  let moonX = boundary + (width - boundary) / 2;
  fill('#E3EAF5');
  circle(moonX, skyY, moonSize);
  fill('#080F1C');
  circle(moonX + moonSize * 0.25, skyY - moonSize * 0.12,
    moonSize * 0.9);

  // A small village anchors the scene while the sky changes.
  let groundY = height * 0.84;
  let houseWidth = min(width * 0.075, height * 0.13);
  for (let i = 0; i < 5; i++) {
    let x = width * (0.18 + i * 0.16);
    let houseHeight = houseWidth * (0.85 + (i % 3) * 0.18);
    drawHouse(x, groundY, houseWidth, houseHeight, boundary);
  }
  fill('#101E2B');
  rect(0, groundY, width, height - groundY);

  // Show the actual local time in 24-hour format, centered on the canvas.
  let clockText = nf(h, 2) + ':' + nf(m, 2) + ':' + nf(floor(s), 2);
  fill('#F3F6FA');
  textFont('monospace');
  textSize(min(width * 0.075, height * 0.09, 72));
  textAlign(CENTER, CENTER);
  text(clockText, width / 2, height / 2);
}

function drawHouse(x, groundY, w, h, boundary) {
  let top = groundY - h;
  fill('#101E2B');
  rect(x - w / 2, top, w, h);
  triangle(x - w * 0.62, top, x, top - w * 0.45,
    x + w * 0.62, top);

  // Windows light up on the night side as the boundary passes them.
  for (let side of [-1, 1]) {
    let windowX = x + side * w * 0.23;
    fill(windowX > boundary ? '#F4CE83' : '#57788E');
    rect(windowX - w * 0.075, top + h * 0.3, w * 0.15, h * 0.2);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
