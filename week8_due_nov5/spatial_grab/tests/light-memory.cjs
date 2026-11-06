const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const paints = [];
function createGraphics() {
  const calls = [];
  const drawingContext = new Proxy({}, { get: (target, key) => target[key] ?? ((...args) => calls.push([key, ...args])) });
  const g = { calls, drawingContext, pixelDensity() {}, background() { calls.length = 0; }, stroke() {}, strokeWeight() {}, line() {} };
  paints.push(g);
  return g;
}
const sandbox = { console, createGraphics, window: { addEventListener() {} }, document: { addEventListener() {} } };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../sketch.js'), 'utf8'), sandbox);
const run = code => vm.runInContext(code, sandbox);
run('createWallSurfaces()');
for (const [direction, wall] of [['[0,0,-1]', 'back'], ['[-1,0,0]', 'left'], ['[1,0,0]', 'right'], ['[0,-1,0]', 'ceiling'], ['[0,1,0]', 'floor']]) {
  assert.equal(run(`rayWallHit([0,0,-180], ${direction}).wall.id`), wall);
}
assert.equal(run('rayWallHit([0,0,-180], [0,0,1])'), null, 'Front is open');
for (let step = 0; step < 50; step++) {
  run(`for (const beam of beams) {
    const d = beamDirection(beam, ${step / 5});
    if (Math.abs(Math.hypot(...d) - 1) > 1e-8) throw Error('Non-unit ray');
    const hit = rayWallHit([110, -60, -220], d);
    if (hit && (hit.x < -1e-6 || hit.y < -1e-6 || hit.x > hit.wall.width+1e-6 || hit.y > hit.wall.height+1e-6)) throw Error('Out of bounds');
  }`);
}
run('var hit = rayWallHit([0,0,-180], [0,0,-1]); exposeWalls([hit]);');
assert(paints[0].calls.some(c => c[0] === 'arc'), 'First exposure stamps a dot');
paints[0].calls.length = 0;
run('exposeWalls([{...hit,x:hit.x+10}])');
assert(paints[0].calls.some(c => c[0] === 'lineTo'), 'Continuous exposure connects points');
run('releaseHand()');
assert(paints[0].calls.length > 0, 'Release retains painting');
paints[0].calls.length = 0;
run('exposeWalls([hit])');
assert(!paints[0].calls.some(c => c[0] === 'lineTo'), 'New gesture never bridges old stroke');
run('exposeWalls([rayWallHit([0,0,-180],[1,0,0])])');
assert(!paints[2].calls.some(c => c[0] === 'lineTo'), 'Changing walls never draws a diagonal bridge');
run('exposureSeconds=10;clearPainting()');
assert.equal(run('exposureSeconds'), 0);
assert.equal(run('previousHits.length'), 0);
assert(paints.every(p => p.calls.length === 0));
console.log('PASS: five walls, open front, rotated ray bounds, permanent strokes, release/wall transitions and clear.');
