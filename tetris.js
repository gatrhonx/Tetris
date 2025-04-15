
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const heldCanvas = document.getElementById('held-piece');
const heldContext = heldCanvas.getContext('2d');
heldContext.scale(20, 20);

const matrixes = {
  T: [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0]
  ],
  O: [
    [2, 2],
    [2, 2]
  ],
  L: [
    [0, 3, 0],
    [0, 3, 0],
    [0, 3, 3]
  ],
  J: [
    [0, 4, 0],
    [0, 4, 0],
    [4, 4, 0]
  ],
  I: [
    [0, 5, 0, 0],
    [0, 5, 0, 0],
    [0, 5, 0, 0],
    [0, 5, 0, 0]
  ],
  S: [
    [0, 6, 6],
    [6, 6, 0],
    [0, 0, 0]
  ],
  Z: [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0]
  ]
};

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF'
];

const arena = createMatrix(12, 20);
const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
  held: null,
  canHold: true
};

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function drawMatrix(matrix, offset, ctx = context) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (
        m[y][x] !== 0 &&
        (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    player.canHold = true;
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = 'TJLOSZI';
  player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);

  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
  }
}

function playerHold() {
  if (!player.canHold) return;
  if (player.held) {
    let temp = player.held;
    player.held = player.matrix;
    player.matrix = temp;
  } else {
    player.held = player.matrix;
    playerReset();
  }
  player.pos.y = 0;
  player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
  player.canHold = false;
  drawHeld();
}

function drawHeld() {
  heldContext.clearRect(0, 0, heldCanvas.width, heldCanvas.height);
  if (player.held) drawMatrix(player.held, { x: 1, y: 1 }, heldContext);
}

function createPiece(type) {
  return matrixes[type];
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function handleControl(key) {
  const e = { key };
  onKeyDown(e);
}

function onKeyDown(e) {
  if (e.key === 'a') playerMove(-1);
  else if (e.key === 'd') playerMove(1);
  else if (e.key === 's') playerDrop();
  else if (e.key === 'c') playerHold();
  else if (e.key === 'q') playerRotate(-1);
  else if (e.key === 'e') playerRotate(1);
  else if (e.key === ' ') {
    while (!collide(arena, player)) {
      player.pos.y++;
    }
    player.pos.y--;
    playerDrop();
  }
}

document.addEventListener('keydown', onKeyDown);

playerReset();
update();
