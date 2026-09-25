// This is the sketch.js file.
// Press 's' to export the SVG.
// Note that p5.js is used in 'global mode'.

p5.disableFriendlyErrors = true; // keep warnings quiet
let bDoExportSvg = false;

const wtcHeight = 680;
const wtcRoofY = 920 - wtcHeight;
const wtcSpireY = 920 - wtcHeight * 1776 / 1368;
const wtcBaseWidth = 210;
const wtcTopWidth = 112;
const oneWTC = [
  [408 - wtcTopWidth / 2, wtcRoofY],
  [408 + wtcTopWidth / 2, wtcRoofY],
  [408 + wtcBaseWidth / 2, 920],
  [408 - wtcBaseWidth / 2, 920]
];

function setup(){
  createCanvas(816, 1056);
  noLoop();
}

function keyPressed(){
  if (key == 's'){
    bDoExportSvg = true;
    redraw();
  }
}

function draw(){
  background(255);
  if (bDoExportSvg){
    beginRecordSvg("myOutput.svg");
  }

  // Draw stuff here:
  push();
  const drawingHeight = 920 - wtcSpireY;
  translate((width - 816) / 2, (height - drawingHeight) / 2 - wtcSpireY);
  noFill();
  stroke(0);

  drawTwin(190, 300, 180, 620, true); 
  drawTwin(446, 300, 180, 620, false); 
  drawOneWTC();
  pop();

  if (bDoExportSvg){
    endRecordSvg();
    bDoExportSvg = false;
  }
}

function drawOneWTC() {
  const [tl, tr, br, bl] = oneWTC;
  //vertical lines, 32 columns
  for (let i = 1; i < 32; i++) {
    const t = i / 32;
    line(lerp(tl[0], tr[0], t), tl[1], lerp(bl[0], br[0], t), bl[1]);
  }
 
  //two diagnal lines
  const center = (bl[0] + br[0]) / 2;
  line(tl[0], tl[1], center, bl[1]);
  line(tr[0], tr[1], center, br[1]);
  // edge lines
  for (let i = 0; i < 4; i++) {
    const a = oneWTC[i];
    const b = oneWTC[(i + 1) % 4];
    line(a[0], a[1], b[0], b[1]);
  }
  line(center, tl[1], center, wtcSpireY);
  line(center - 5, wtcSpireY + 35, center + 5, wtcSpireY + 35);
}

function drawTwin(x, y, w, h, antenna) {
  const columns = 36;

  function gridLine(u1, v1, u2, v2) {
    line(x + w * u1, y + h * v1, x + w * u2, y + h * v2);
  }
  for (let col = 0; col < columns; col++) {
    const u = (col + 0.5) / columns;
    gridLine(u, 0.018, u, 0.94);
  }
  // bottom lines
  for (let col = 0; col < columns; col += 3) {
    const count = min(3, columns-col);
    const center = (col + count/2) / columns;
    for (let branch = 0; branch < count; branch++) {
      gridLine((col + branch + 0.5) / columns, 0.94, center, 0.965);
    }
    gridLine(center, 0.965, center, 1);
  }
  // rings。
  for (const v of [0.018,0.31,0.62,0.925]) {
    for (let k = 0; k <= 4; k++) {
      gridLine(0, v + k * 0.00375, 1, v + k * 0.00375);
    }
  }
  // edge lines
  gridLine(0, 0, 1, 0);
  gridLine(1, 0, 1, 1);
  gridLine(1, 1, 0, 1);
  gridLine(0, 1, 0, 0);

  if (antenna) {
    const cx = x + w / 2;
    const tipY = y - h * 0.26;
    line(cx, y, cx, tipY);
    line(cx - 5, tipY + 35, cx + 5, tipY + 35);
  }
}
