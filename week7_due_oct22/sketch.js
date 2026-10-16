function setup() {
  createCanvas(400, 400);
  background(220);
}

function draw() {
  
}

function mousePressed() {
  //drawRandomCircle(mouseX, mouseY);

  let r = new Rect(mouseX, mouseY, random(30, 90), random(30, 90), 10,10);
  r.draw();
}

class Rect {
  constructor(x, y, w, h, alpha,rad) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.alpha = alpha;
    this.rad = rad;

    this.angle = random(2*PI);
  }

  draw() {
    push();

    translate(this.x, this.y);
    rotate(this.angle);

    fill(random(10,160), random(100,220), random(100,255), this.alpha);

    rect(0, 0, this.w, this.h, this.rad);

    pop();
  }
}


class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  draw() {
    fill(random(255), random(255), random(255));
    ellipse(this.x, this.y, this.r*2, this.r*2);
  }
}
function drawRandomCircle(x=random(width), y=random(height), r=random(10, 50)) {
  fill(random(255), random(255), random(255));
  ellipse(x, y, r*2, r*2);
}
