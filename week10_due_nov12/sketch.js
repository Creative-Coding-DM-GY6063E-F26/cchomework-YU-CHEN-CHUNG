let sounds = [null, null, null];
let amplitudes = [null, null, null];
let loadingFailed = [false, false, false];

const files = ['yo.m4a', 'aaa.m4a', 'wjlnb.mp3'];
const keys = ['a', 's', 'd'];
const colors = [[239, 148, 125], [230, 198, 108], [141, 201, 176]];
const buttonSize = 130;

async function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('sans-serif');

  await Promise.all(files.map(async (file, i) => {
    try {
      const sound = await loadSound(file);
      amplitudes[i] = new p5.Amplitude(0.7);
      amplitudes[i].setInput(sound);
      sounds[i] = sound;
    } catch (error) {
      loadingFailed[i] = true;
      console.error('Could not load ' + file, error);
    }
  }));
}

function draw() {
  background(244, 241, 233);
  noStroke();
  fill(37, 49, 65);
  textSize(18);
  text('SOUND BOXES', width / 2, 28);
  textSize(11);
  text('Click a box or press A / S / D', width / 2, 52);

  let hovering = false;
  for (let i = 0; i < sounds.length; i++) {
    const x = i === 2 ? 200 : 110 + i * 180;
    const y = 140 + floor(i / 2) * 150;
    const playing = sounds[i] && sounds[i].isPlaying();
    // Actual audio volume drives the motion; silence produces no vibration.
    const volume = playing ? amplitudes[i].getLevel() : 0;
    const energy = constrain(volume * 5, 0, 1);
    const shake = energy * 5;
    const hovered = abs(mouseX - x) < buttonSize / 2 && abs(mouseY - y) < buttonSize / 2;
    if (hovered && sounds[i]) hovering = true;

    push();
    translate(x + random(-shake, shake), y + random(-shake, shake));
    rotate(sin(millis() * 0.04 + i) * energy * 0.035);
    scale(1 + energy * 0.08);
    stroke(37, 49, 65);
    strokeWeight(hovered || playing ? 3 : 1);
    fill(colors[i][0], colors[i][1], colors[i][2]);
    rect(0, 0, buttonSize, buttonSize, 14);
    noStroke();
    fill(37, 49, 65);
    textSize(32);
    text(keys[i].toUpperCase(), 0, -14);
    textSize(11);
    text(loadingFailed[i] ? 'Load failed' : !sounds[i] ? 'Loading…' : playing ? 'Playing' : 'Click to play', 0, 26);
    pop();
  }
  cursor(hovering ? HAND : ARROW);
}

async function playSound(i) {
  if (!sounds[i]) return;
  try {
    await userStartAudio();

    sounds[i].stop();
    sounds[i].play();
  } catch (error) {
    console.error('Could not play sound', error);
  }
}

function keyPressed(event) {
  if (event?.repeat) return;
  const i = keys.indexOf(key.toLowerCase());
  if (i !== -1) playSound(i);
}

function mousePressed() {
  for (let i = 0; i < sounds.length; i++) {
    const x = i === 2 ? 200 : 110 + i * 180;
    const y = 140 + floor(i / 2) * 150;
    if (abs(mouseX - x) < buttonSize / 2 && abs(mouseY - y) < buttonSize / 2) {
      playSound(i);
      break;
    }
  }
}
