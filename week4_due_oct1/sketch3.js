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
    beginRecordSvg("moire-circles.svg");
  }

  noFill();
  stroke(0);
  strokeWeight(1);

  for (let radius = 280; radius >= 5; radius -= 7.5){
    circle(width / 2 - 24, height / 2, radius * 2);
    circle(width / 2 + 24, height / 2, radius * 2);
  }

  if (bDoExportSvg){
    endRecordSvg();
    bDoExportSvg = false;
  }
}
