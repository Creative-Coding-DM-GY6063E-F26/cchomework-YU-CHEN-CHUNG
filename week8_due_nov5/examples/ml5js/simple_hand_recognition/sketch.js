let vid, handPose, statusText, metrics, previewStatus;
let previewCanvas, previewContext;
let trackedHands = [];
let gestureMode = 'idle';
let dualStart = null;
let hands = [];
let cursor = null;
let pinching = false;
let dragging = false;
let activeSide = null;
let lastDetection = 0;
let modelReady = false;
let failure = '';
const cube = { x: 0, y: 0, z: -180, size: 90, scale: 1, rotation: 0 };
const grabStart = { x: 0, y: 0, palm: 1, cubeX: 0, cubeY: 0, cubeZ: 0 };
const room = { halfWidth: 420, halfHeight: 240, back: -700, front: 250 };

async function setup() {
  const canvas = createCanvas(min(960, windowWidth - 32), min(600, (windowWidth - 32) * 0.625), WEBGL);
  pixelDensity(1);
  const cubeCamera = createCamera();
  cubeCamera.setPosition(0, -20, 900);
  cubeCamera.lookAt(0, 0, -180);
  cubeCamera.perspective(PI / 3, width / height, 10, 3000);
  const page = document.createElement('main');
  document.body.appendChild(page);
  page.innerHTML = '<h1>Spatial Grab</h1><p>Pinch anywhere to grab the cube. Move your hand left, right, up or down. Move toward the camera to push the cube deeper, or away to pull it closer. Open your fingers to release. Pinch with both hands: twist to rotate, spread apart to enlarge, or bring together to shrink.</p>';
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
  workspace.appendChild(preview);
  statusText = document.createElement('p');
  statusText.className = 'status';
  page.appendChild(statusText);
  metrics = document.createElement('p');
  page.appendChild(metrics);
  const reset = document.createElement('button');
  reset.textContent = 'Reset cube';
  reset.onclick = () => {
    releaseHand();
    cube.x = 0;
    cube.y = 0;
    cube.z = -180;
    cube.scale = 1;
    cube.rotation = 0;
  };
  page.appendChild(reset);
  const note = document.createElement('p');
  note.textContent = 'Keep your palm facing the camera. Depth is estimated from changes in palm size; turning your hand may affect it.';
  page.appendChild(note);
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
  dualStart = null;
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
    // Use video pixels for rotation and distance so aspect ratio cannot distort gestures.
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

  if (closed.length === 2) {
    const [a, b] = closed;
    const separation = Math.hypot(b.x - a.x, b.y - a.y);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const ids = closed.map(hand => hand.id).join('|');
    // Re-anchor on entry so switching from one hand never jumps the cube.
    if (gestureMode !== 'dual' || dualStart.ids !== ids) {
      dualStart = { ids, distance: Math.max(separation, 40), scale: cube.scale, angle };
      gestureMode = 'dual';
    } else if (separation > 40) {
      const delta = Math.atan2(Math.sin(angle - dualStart.angle), Math.cos(angle - dualStart.angle));
      cube.rotation += delta;
      dualStart.angle = angle;
      cube.scale = constrain(dualStart.scale * separation / dualStart.distance, 0.35, 2.5);
      constrainCube();
    }
    activeSide = null;
    return;
  }

  dualStart = null;
  if (!closed.length) {
    gestureMode = 'idle';
    activeSide = null;
    return;
  }
  const hand = closed[0];
  const x = (hand.x / vid.width - 0.5) * room.halfWidth * 2;
  const y = (hand.y / vid.height - 0.5) * room.halfHeight * 2;
  if (gestureMode !== 'single' || activeSide !== hand.id) {
    Object.assign(grabStart, {
      x, y, palm: hand.palm, cubeX: cube.x, cubeY: cube.y, cubeZ: cube.z
    });
    gestureMode = 'single';
    activeSide = hand.id;
  }
  cube.x = grabStart.cubeX + x - grabStart.x;
  cube.y = grabStart.cubeY + y - grabStart.y;
  cube.z = grabStart.cubeZ - 600 * Math.log(hand.palm / grabStart.palm);
  constrainCube();
}

function constrainCube() {
  // The bounding sphere keeps the scaled, rotated cube inside the room.
  const margin = cube.size * cube.scale * Math.sqrt(3) / 2;
  cube.x = constrain(cube.x, -room.halfWidth + margin, room.halfWidth - margin);
  cube.y = constrain(cube.y, -room.halfHeight + margin, room.halfHeight - margin);
  cube.z = constrain(cube.z, room.back + margin, room.front - margin);
}

// Receding floor, ceiling and wall grids make depth visible without video.
function drawRoom() {
  push();
  noFill();
  strokeWeight(1);
  stroke(52, 76, 108);
  const w = room.halfWidth;
  const h = room.halfHeight;
  for (let z = room.back; z <= room.front; z += 100) {
    line(-w, h, z, w, h, z);
    line(-w, -h, z, w, -h, z);
    line(-w, -h, z, -w, h, z);
    line(w, -h, z, w, h, z);
  }
  for (let x = -w; x <= w; x += 60) {
    line(x, h, room.back, x, h, room.front);
    line(x, -h, room.back, x, -h, room.front);
    line(x, -h, room.back, x, h, room.back);
  }
  for (let y = -h; y <= h; y += 60) {
    line(-w, y, room.back, w, y, room.back);
    line(-w, y, room.back, -w, y, room.front);
    line(w, y, room.back, w, y, room.front);
  }
  // A floor marker and vertical guide connect the cube to the room.
  stroke(dragging ? '#70efbe' : '#6aa9e9');
  line(cube.x, cube.y, cube.z, cube.x, h, cube.z);
  translate(cube.x, h - 1, cube.z);
  rotateX(HALF_PI);
  ellipse(0, 0, cube.size * cube.scale * 1.4, cube.size * cube.scale * 1.4);
  pop();
}

function draw() {
  if (cursor && millis() - lastDetection > 700) releaseHand();
  background(12, 19, 33);
  drawRoom();
  push();
  ambientLight(160);
  directionalLight(255, 255, 255, -0.5, 0.6, -1);
  translate(cube.x, cube.y, cube.z);
  rotateZ(cube.rotation);
  rotateX(-0.35);
  rotateY(0.55);
  stroke(dragging ? '#bdffe3' : '#bde5ff');
  strokeWeight(1.5);
  ambientMaterial(dragging ? '#45dca5' : '#539be8');
  box(cube.size * cube.scale);
  pop();
  statusText.textContent = failure || (!modelReady ? 'Starting camera and loading model…' : !cursor ? 'Waiting for your hand…' : gestureMode === 'dual' ? 'Two hands · Twist to rotate, spread or pinch together to scale' : dragging ? 'Grabbed · Move in 3D, open your fingers to release' : 'Ready · Pinch anywhere to grab');
  metrics.textContent = `X: ${Math.round(cube.x)} | Y: ${Math.round(cube.y)} | Z: ${Math.round(cube.z)} | Scale: ${cube.scale.toFixed(2)}× | Rotation: ${Math.round(cube.rotation * 180 / Math.PI)}° · +Z toward you / −Z into the room`;
  previewStatus.textContent = failure ? 'Tracking unavailable' : !modelReady ? 'Loading hand tracking…' : cursor ? `${trackedHands.length} hand(s) · ${trackedHands.filter(hand => hand.pinching).length} pinching` : 'No hand detected — bring your hand into view';
  previewStatus.dataset.tracked = String(Boolean(cursor));
  drawTrackingPreview();
}

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
