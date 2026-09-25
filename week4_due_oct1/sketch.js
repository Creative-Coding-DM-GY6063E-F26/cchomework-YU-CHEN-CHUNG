// TWIN TOWERS — architectural facade study
// S: SVG. P: PNG.
// Only architectural lines: any moire comes from display sampling or resizing.
let exportSvg = false;

function setup() {
  createCanvas(816, 1056);
  pixelDensity(2);
  noLoop();
}

function draw() {
  background(245, 243, 235);
  if (exportSvg) beginRecordSvg("twin-towers.svg");
  // Parallel projection: two walls and a roof form each rectangular prism.
  drawTower(463, 176, 180, 88, 704, 32, false);
  drawTower(235, 218, 173, 85, 706, 35, true);
  //noStroke();
 
  if (exportSvg) {
    endRecordSvg();
    exportSvg = false;
  }
}

function drawTower(x, y, w, depth, h, rise, antenna) {
  // Face corners: top-left, top-right, bottom-right, bottom-left.
  const front = [[x,y], [x+w,y-8], [x+w,y+h-8], [x,y+h]];
  const side = [[x-depth,y-rise], [x,y], [x,y+h], [x-depth,y+h-rise]];
  const roof = [[x-depth,y-rise], [x+w-depth,y-rise-8], [x+w,y-8], [x,y]];
  drawFace(side, [174,177,173], [83,91,91], 59);
  drawFace(front, [224,224,212], [61,72,77], 59);
  fill(235,232,219);
  stroke(92,99,98);
  strokeWeight(0.8);
  polygon(roof);
  const rx = x + w * 0.4 - depth * 0.45;
  const ry = y - rise * 0.5 - 5;
  fill(170,176,173);
  rect(rx-14, ry-8, 30, 8);
  if (antenna) {
    stroke(81,91,94);
    strokeWeight(2);
    line(rx,ry-8,rx,ry-91);
    strokeWeight(0.65);
    line(rx-9,ry-8,rx,ry-48);
    line(rx+9,ry-8,rx,ry-48);
    line(rx-4,ry-62,rx+4,ry-62);
  }
}

function drawFace(corners, faceColor, lineColor, columns) {
  noStroke();
  fill(...faceColor);
  polygon(corners);
  // Floor lines are quieter than the continuous vertical mullions.
  stroke(...lineColor,48);
  strokeWeight(0.35);
  for (let floor = 1; floor < 110; floor++) {
    faceLine(corners,0,floor/110,1,floor/110);
  }
  stroke(...lineColor);
  strokeWeight(0.85);
  for (let col = 0; col < columns; col++) {
    const u = (col + 0.5) / columns;
    faceLine(corners,u,0.018,u,0.94);
  }
  // Groups of slender columns branch into wider-spaced lobby piers.
  for (let col = 0; col < columns; col += 3) {
    const count = min(3, columns-col);
    const center = (col + count/2) / columns;
    for (let branch = 0; branch < count; branch++) {
      faceLine(corners,(col+branch+0.5)/columns,0.94,center,0.965);
    }
    faceLine(corners,center,0.965,center,1);
  }
  // Simplified mechanical-floor bands near roof, middle, and lobby.
  for (const v of [0.018,0.31,0.62,0.925]) {
    noStroke();
    fill(...faceColor);
    polygon([facePoint(corners,0,v),facePoint(corners,1,v),
      facePoint(corners,1,v+0.015),facePoint(corners,0,v+0.015)]);
    stroke(...lineColor,180);
    strokeWeight(0.5);
    for (let k = 0; k <= 4; k++) {
      faceLine(corners,0,v+k*0.00375,1,v+k*0.00375);
    }
  }
  noFill();
  stroke(...lineColor);
  strokeWeight(0.85);
  polygon(corners);
}

function facePoint(corners,u,v) {
  const topX = lerp(corners[0][0],corners[1][0],u);
  const topY = lerp(corners[0][1],corners[1][1],u);
  const bottomX = lerp(corners[3][0],corners[2][0],u);
  const bottomY = lerp(corners[3][1],corners[2][1],u);
  return [lerp(topX,bottomX,v),lerp(topY,bottomY,v)];
}

function faceLine(corners,u1,v1,u2,v2) {
  const a = facePoint(corners,u1,v1);
  const b = facePoint(corners,u2,v2);
  line(a[0],a[1],b[0],b[1]);
}

function polygon(points) {
  beginShape();
  for (const p of points) vertex(p[0],p[1]);
  endShape(CLOSE);
}

function keyPressed() {
  if (key === "s" || key === "S") {
    if (typeof beginRecordSvg === "function") exportSvg = true;
    else alert("SVG exporter has not loaded. Check your connection, or press P for PNG.");
  }
  if (key === "p" || key === "P") saveCanvas("twin-towers","png");
  redraw();
}
