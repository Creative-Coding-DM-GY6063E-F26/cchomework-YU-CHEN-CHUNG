let vid, handPose, statusText, metrics, previewStatus;
let previewCanvas, previewContext;
let trackedHands = [];
let gestureMode = 'idle';
let spin = 0;
let previousHits = [];
let exposureSeconds = 0;
let wallSurfaces = [];
const beamColors = ['#ff739d', '#ffd875', '#70efcf', '#79bfff', '#c397ff', '#ffab76'];
const beams = Array.from({ length: 24 }, (_, i) => {
  const y = 1 - 2 * (i + 0.5) / 24;
  const radius = Math.sqrt(1 - y * y);
  const angle = i * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius, color: beamColors[i % beamColors.length] };
});
let hands = [];
let cursor = null;
let pinching = false;
let dragging = false;
let activeSide = null;
let lastDetection = 0;
let modelReady = false;
let failure = '';
const ball = { x: 0, y: 0, z: -180, size: 66 };
const grabStart = { x: 0, y: 0, palm: 1, ballX: 0, ballY: 0, ballZ: 0 };
const room = { halfWidth: 420, halfHeight: 240, back: -700, front: 250 };

async function setup() {
  const canvas = createCanvas(min(960, windowWidth - 32), min(600, (windowWidth - 32) * 0.625), WEBGL);
  pixelDensity(1);
  const ballCamera = createCamera();
  ballCamera.setPosition(0, -20, 900);
  ballCamera.lookAt(0, 0, -180);
  ballCamera.perspective(PI / 3, width / height, 10, 3000);
  const page = document.createElement('main');
  document.body.appendChild(page);
  createWallSurfaces();
  page.innerHTML = '<h1>Light Memory</h1><p>Move a little light. Leave a room full of memories. Pinch to move the disco ball and expose the walls; open your fingers to pause. Move toward the camera to push the ball deeper, or away to bring it closer.</p>';
  const workspace = document.createElement('div');
  workspace.className = 'workspace';
  page.appendChild(workspace);
  const scene = document.createElement('div');
  scene.className = 'scene';
  scene.appendChild(canvas.elt);
  workspace.appendChild(scene);
  const preview = document.createElement('aside');
  preview.className = 'camera-preview';
  preview.innerHTML = '<h2>Camera</h2>';
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  workspace.appendChild(sidebar);
  sidebar.appendChild(preview);
  statusText = document.createElement('p');
  statusText.className = 'status';
  sidebar.appendChild(statusText);
  metrics = document.createElement('p');
  sidebar.appendChild(metrics);
  const reset = document.createElement('button');
  reset.textContent = 'Recenter light';
  reset.onclick = () => {
    releaseHand();
    ball.x = 0;
    ball.y = 0;
    ball.z = -180;
  };
  sidebar.appendChild(reset);
  const clear = document.createElement('button');
  clear.textContent = 'Clear painting';
  clear.onclick = clearPainting;
  sidebar.appendChild(clear);
  const save = document.createElement('button');
  save.textContent = 'Save image';
  save.onclick = () => saveCanvas('light-memory', 'png');
  sidebar.appendChild(save);
  const note = document.createElement('p');
  note.textContent = 'The ball turns slowly on its own. Traces stay until you clear or reload. Save an image to keep your work. Keep your palm facing the camera for steadier depth.';
  sidebar.appendChild(note);
  vid = createCapture(VIDEO);
  vid.size(640, 480);
  vid.elt.className = 'camera-feed';
  vid.elt.style.width = '100%';
  vid.elt.style.height = 'auto';
  vid.elt.setAttribute('aria-label', 'Mirrored live camera preview');
  const cameraFrame = document.createElement('div');
  cameraFrame.className = 'camera-frame';
  preview.appendChild(cameraFrame);
  cameraFrame.appendChild(vid.elt);
  previewCanvas = document.createElement('canvas');
  previewCanvas.width = 640;
  previewCanvas.height = 480;
  previewCanvas.className = 'tracking-overlay';
  previewCanvas.setAttribute('aria-hidden', 'true');
  previewContext = previewCanvas.getContext('2d');
  cameraFrame.appendChild(previewCanvas);
  previewStatus = document.createElement('p');
  previewStatus.className = 'tracking-status';
  preview.appendChild(previewStatus);
  try {
    handPose = await ml5.handPose({ maxHands: 2 });
    modelReady = true;
    handPose.detectStart(vid, gotHands);
  } catch (error) {
    failure = 'Could not start the model. Check your connection and camera permissions, then refresh.';
    console.error(error);
  }
}

function releaseHand() {
  dragging = false;
  pinching = false;
  activeSide = null;
  cursor = null;
  trackedHands = [];
  gestureMode = 'idle';
  previousHits = [];
}

function gotHands(results, error) {
  if (error) {
    failure = 'Hand tracking failed. Refresh the page to try again.';
    releaseHand();
    return;
  }
  hands = results || [];
  lastDetection = millis();
  const previous = new Map(trackedHands.map(hand => [hand.id, hand]));
  trackedHands = hands.slice(0, 2).flatMap((hand, index) => {
    const points = hand.keypoints;
    if (!points || points.length < 21) return [];
    const palm = Math.hypot(points[0].x - points[9].x, points[0].y - points[9].y);
    if (palm < 10) return [];
    const id = hand.handedness || `hand-${index}`;
    const prev = previous.get(id);
    const ratio = Math.hypot(points[4].x - points[8].x, points[4].y - points[8].y) / palm;
    // Measure the pinch midpoint in camera pixels before mapping it into the room.
    const x = vid.width - (points[4].x + points[8].x) / 2;
    const y = (points[4].y + points[8].y) / 2;
    return [{ id, points, ratio,
      pinching: ratio < (prev?.pinching ? 0.48 : 0.3),
      x: prev ? lerp(prev.x, x, 0.4) : x,
      y: prev ? lerp(prev.y, y, 0.4) : y,
      palm: prev ? lerp(prev.palm, palm, 0.25) : palm
    }];
  });
  if (!trackedHands.length) {
    releaseHand();
    return;
  }
  const closed = trackedHands.filter(hand => hand.pinching).sort((a, b) => a.id.localeCompare(b.id));
  pinching = closed.length > 0;
  dragging = pinching;
  cursor = { x: trackedHands[0].x, y: trackedHands[0].y };

  if (!closed.length) {
    gestureMode = 'idle';
    previousHits = [];
    activeSide = null;
    return;
  }
  const hand = closed.find(hand => hand.id === activeSide) || closed[0];
  const x = (hand.x / vid.width - 0.5) * room.halfWidth * 2;
  const y = (hand.y / vid.height - 0.5) * room.halfHeight * 2;
  if (gestureMode !== 'single' || activeSide !== hand.id) {
    previousHits = [];
    Object.assign(grabStart, {
      x, y, palm: hand.palm, ballX: ball.x, ballY: ball.y, ballZ: ball.z
    });
    gestureMode = 'single';
    activeSide = hand.id;
  }
  ball.x = grabStart.ballX + x - grabStart.x;
  ball.y = grabStart.ballY + y - grabStart.y;
  ball.z = grabStart.ballZ - 600 * Math.log(hand.palm / grabStart.palm);
  constrainBall();
}

function constrainBall() {
  const margin = ball.size / 2 + 16;
  ball.x = constrain(ball.x, -room.halfWidth + margin, room.halfWidth - margin);
  ball.y = constrain(ball.y, -room.halfHeight + margin, room.halfHeight - margin);
  ball.z = constrain(ball.z, room.back + margin, room.front - margin);
}

// Each wall owns one permanent canvas. Memory stays bounded as the painting grows.
function createWallSurfaces() {
  const w = room.halfWidth, h = room.halfHeight, depth = room.front - room.back;
  wallSurfaces = [
    { id: 'back', origin: [-w, -h, room.back], u: [1,0,0], v: [0,1,0], width: w*2, height: h*2 },
    { id: 'left', origin: [-w, -h, room.back], u: [0,0,1], v: [0,1,0], width: depth, height: h*2 },
    { id: 'right', origin: [w, -h, room.back], u: [0,0,1], v: [0,1,0], width: depth, height: h*2 },
    { id: 'ceiling', origin: [-w, -h, room.back], u: [1,0,0], v: [0,0,1], width: w*2, height: depth },
    { id: 'floor', origin: [-w, h, room.back], u: [1,0,0], v: [0,0,1], width: w*2, height: depth }
  ];
  wallSurfaces.forEach(wall => {
    wall.normal = [wall.u[1]*wall.v[2]-wall.u[2]*wall.v[1], wall.u[2]*wall.v[0]-wall.u[0]*wall.v[2], wall.u[0]*wall.v[1]-wall.u[1]*wall.v[0]];
    wall.paint = createGraphics(wall.width, wall.height);
    wall.paint.pixelDensity(1);
  });
  clearPainting();
}

function clearPainting() {
  previousHits = [];
  exposureSeconds = 0;
  wallSurfaces.forEach(wall => {
    const g = wall.paint;
    g.background(wall.id === 'back' ? '#111b30' : '#17243a');
    g.stroke('#25334b');
    g.strokeWeight(1);
    for (let x = 0; x <= wall.width; x += 80) g.line(x, 0, x, wall.height);
    for (let y = 0; y <= wall.height; y += 80) g.line(0, y, wall.width, y);
  });
}

function beamDirection(beam, angle) {
  // Same rotation order as the mirrored ball: fixed tilt, then slow Y rotation.
  const y = beam.y * Math.cos(0.35) - beam.z * Math.sin(0.35);
  const z = beam.y * Math.sin(0.35) + beam.z * Math.cos(0.35);
  return [beam.x * Math.cos(angle) + z * Math.sin(angle), y,
    -beam.x * Math.sin(angle) + z * Math.cos(angle)];
}

function rayWallHit(origin, direction) {
  let closest = null;
  wallSurfaces.forEach(wall => {
    const denominator = wall.normal.reduce((sum, n, i) => sum + n * direction[i], 0);
    if (Math.abs(denominator) < 1e-8) return;
    const t = wall.normal.reduce((sum, n, i) => sum + n * (wall.origin[i] - origin[i]), 0) / denominator;
    if (t <= 0 || (closest && t >= closest.t)) return;
    const point = origin.map((value, i) => value + direction[i] * t);
    const relative = point.map((value, i) => value - wall.origin[i]);
    const x = relative.reduce((sum, value, i) => sum + value * wall.u[i], 0);
    const y = relative.reduce((sum, value, i) => sum + value * wall.v[i], 0);
    if (x < -1e-6 || x > wall.width + 1e-6 || y < -1e-6 || y > wall.height + 1e-6) return;
    closest = { wall, x, y, point, t };
  });
  return closest;
}

function exposeWalls(hits) {
  hits.forEach((hit, index) => {
    if (!hit) return;
    const ctx = hit.wall.paint.drawingContext;
    const last = previousHits[index];
    ctx.save();
    ctx.strokeStyle = beams[index].color;
    ctx.fillStyle = beams[index].color;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (last && last.wall === hit.wall) {
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(hit.x, hit.y);
      ctx.stroke();
    } else {
      ctx.arc(hit.x, hit.y, 1.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
  previousHits = hits;
}

function drawRoom() {
  push();
  noStroke();
  textureMode(NORMAL);
  wallSurfaces.forEach(wall => {
    texture(wall.paint);
    beginShape(QUADS);
    [[0,0], [1,0], [1,1], [0,1]].forEach(([u,v]) => {
      const point = wall.origin.map((value, i) => value + wall.u[i]*wall.width*u + wall.v[i]*wall.height*v);
      vertex(...point, u, v);
    });
    endShape();
  });
  pop();
}

function drawDiscoBall() {
  push();
  translate(ball.x, ball.y, ball.z);
  rotateY(spin);
  rotateX(0.35);
  ambientLight(130);
  directionalLight(255, 244, 219, -0.5, 0.5, -1);
  stroke('#142139');
  strokeWeight(0.7);
  const radius = ball.size / 2;
  // Individual mirror tiles make the light source readable as a disco ball.
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 16; col++) {
      const shade = [145, 190, 225, 170, 245][(row * 7 + col * 3) % 5];
      ambientMaterial(shade * 0.88, shade * 0.95, shade);
      beginShape(QUADS);
      [[row,col], [row+1,col], [row+1,col+1], [row,col+1]].forEach(([r,c]) => {
        const latitude = Math.PI * r / 10, longitude = Math.PI * 2 * c / 16;
        const nx = Math.sin(latitude)*Math.cos(longitude), ny = Math.cos(latitude), nz = Math.sin(latitude)*Math.sin(longitude);
        normal(nx, ny, nz);
        vertex(nx*radius, ny*radius, nz*radius);
      });
      endShape();
    }
  }
  pop();
}

function draw() {
  if (!wallSurfaces.length) return;
  if (cursor && millis() - lastDetection > 700) releaseHand();
  const dt = Math.min(deltaTime / 1000, 0.05);
  spin += dt * 0.16;
  const origin = [ball.x, ball.y, ball.z];
  const hits = beams.map(beam => rayWallHit(origin, beamDirection(beam, spin)));
  if (dragging && !document.hidden) {
    exposureSeconds += dt;
    exposeWalls(hits);
  } else previousHits = [];
  background('#080f20');
  drawRoom();
  drawDiscoBall();
  push();
  hits.forEach((hit, i) => {
    if (!hit) return;
    const tint = color(beams[i].color);
    tint.setAlpha(dragging ? 45 : 20);
    stroke(tint);
    strokeWeight(1);
    const direction = beamDirection(beams[i], spin);
    line(...origin.map((value, axis) => value + direction[axis] * (ball.size / 2 + 1)), ...hit.point);
    // Nudge spots into the room to avoid depth flicker against wall textures.
    const point = hit.point.map((value, axis) => value - direction[axis] * 1.5);
    stroke(beams[i].color);
    strokeWeight(7);
    beginShape(POINTS); vertex(...point); endShape();
    stroke('#ffffff'); strokeWeight(2);
    beginShape(POINTS); vertex(...point); endShape();
  });
  pop();
  statusText.textContent = failure || (!modelReady ? 'Starting camera and loading model…' : dragging ? 'Exposing · Your movement is painting the room' : 'Preview · Pinch to leave a trace');
  metrics.textContent = `Exposure: ${exposureSeconds.toFixed(1)}s · Five surfaces`;
  if (previewStatus) {
    previewStatus.textContent = failure ? 'Tracking unavailable' : !modelReady ? 'Loading hand tracking…' : cursor ? `${trackedHands.length} hand(s) · ${trackedHands.filter(hand => hand.pinching).length} pinching` : 'No hand detected — bring your hand into view';
    previewStatus.dataset.tracked = String(Boolean(cursor));
    drawTrackingPreview();
  }
}

window.addEventListener('blur', releaseHand);
document.addEventListener('visibilitychange', releaseHand);
window.addEventListener('pagehide', () => {
  handPose?.detectStop();
  vid?.elt.srcObject?.getTracks().forEach(track => track.stop());
});

function drawTrackingPreview() {
  const ctx = previewContext;
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.strokeStyle = '#102033';
  ctx.lineWidth = 2;
  trackedHands.forEach(hand => {
    ctx.fillStyle = hand.pinching ? '#ff4545' : '#45ff83';
    hand.points.forEach(point => {
    ctx.beginPath();
    // Mirror the overlay to match the video, using the same full frame.
    ctx.arc((1 - point.x / vid.width) * previewCanvas.width,
      point.y / vid.height * previewCanvas.height, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    });
  });
}
