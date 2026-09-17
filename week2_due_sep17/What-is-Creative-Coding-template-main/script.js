// change the quotes in this array. Be mindful of the quotation marks!
// this is the only part of the file you need to edit!
const quotes = [
  { text: "playing with code instead of solving with it", source: "GPT 5.6 sol" },
  { text: "a discovery-based process consisting of exploration, iteration, and reflection, using code as a primary medium", source: "Mark Mitchell & Oliver Bown" },
  { text: "computer programming in which the goal is to create something expressive instead of something functional", source: "Wikipedia" },
  { text: "uses software, code and computational processes to be expressive or to create art forms", source: "University of the Arts London" },
  { text: "artistic practices that use computer code as a medium", source: "Creative Code Berlin" },
];
// no need to edit anything below this line! 
// if you have made an error, you can check your history to see what might have gone wrong

// a variable tht holds the current quote
let current = [];
let pageTurn = 0;
let isTurning = false;
let quoteChanged = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  randomSeed(millis());
  pickQuote(); // calls the function to pick a quote
}

function pickQuote() {
  // take a random number and use that to identify what quote to use
  let next = random(quotes);
  while (next === current) {
    next = random(quotes);
  }
  current = next;
}

function draw() {
  background(255, 20, 250);

  if (isTurning) {
    pageTurn += 0.12;

    if (pageTurn >= HALF_PI && !quoteChanged) {
      pickQuote();
      quoteChanged = true;
    }

    if (pageTurn >= PI) {
      pageTurn = 0;
      isTurning = false;
      quoteChanged = false;
    }
  }

  drawQuote(); // draw the quote on screen
}

function drawQuote() {
  // draw text
  push();
  translate(width / 2, 0);
  scale(abs(cos(pageTurn)), 1);
  translate(-width / 2, 0);

  fill(10, 255, 10);
  textSize(32);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("Creative Coding is.....", width / 2, height / 2 -100);
  text("“" + current.text + "”", width / 2, height / 2);
  textAlign(RIGHT, CENTER);
  text("-" + current.source, width - 100, height - 100);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function newQuote() {
  if (!isTurning) {
    isTurning = true;
  }
}

function mousePressed() {
  newQuote(); 
}
