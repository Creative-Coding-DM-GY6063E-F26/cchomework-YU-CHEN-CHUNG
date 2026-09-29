p5.disableFriendlyErrors = true;
let bDoExportSvg = false;

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
    beginRecordSvg("moire-lines.svg");
  }

  noFill();
  stroke(0);
  strokeWeight(1);
  push();
  translate(width / 2, height / 2);

  for (let x = -240; x <= 240; x += 7.5){
    line(x, -300, x, 300);
  }

  rotate(4 * Math.PI / 180);
  for (let x = -237.5; x <= 240; x += 7.5){
    line(x, -300, x, 300);
  }
  pop();

  if (bDoExportSvg){
    endRecordSvg();
    bDoExportSvg = false;
  }
}
