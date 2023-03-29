const canvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gridWidth = 200;
const gridHeight = Math.round(gridWidth * (canvas.height / canvas.width));

const scaleX = canvas.width / gridWidth;
const scaleY = canvas.height / gridHeight;

const diffusionRateA = 1.0;
const diffusionRateB = 0.5;
const feedRate = 0.055;
const killRate = 0.062;

function createGrid(width, height) {
  const grid = new Array(width);
  for (let x = 0; x < width; x++) {
    grid[x] = new Array(height);
    for (let y = 0; y < height; y++) {
      grid[x][y] = { a: 1, b: 0 };
    }
  }
  return grid;
}

function seedGrid(grid) {
  for (let x = Math.floor(gridWidth / 2) - 10; x < Math.floor(gridWidth / 2) + 10; x++) {
    for (let y = Math.floor(gridHeight / 2) - 10; y < Math.floor(gridHeight / 2) + 10; y++) {
      grid[x][y].b = 1;
    }
  }
}


let grid = createGrid(gridWidth, gridHeight);
let nextGrid = createGrid(gridWidth, gridHeight);

seedGrid(grid);

function laplaceA(x, y, grid) {
  const sum = grid[x][y].a * -1 +
    grid[(x + 1) % gridWidth][y].a * 0.2 +
    grid[(x - 1 + gridWidth) % gridWidth][y].a * 0.2 +
    grid[x][(y + 1) % gridHeight].a * 0.2 +
    grid[x][(y - 1 + gridHeight) % gridHeight].a * 0.2 +
    grid[(x + 1) % gridWidth][(y + 1) % gridHeight].a * 0.05 +
    grid[(x - 1 + gridWidth) % gridWidth][(y - 1 + gridHeight) % gridHeight].a * 0.05 +
    grid[(x + 1) % gridWidth][(y - 1 + gridHeight) % gridHeight].a * 0.05 +
    grid[(x - 1 + gridWidth) % gridWidth][(y + 1) % gridHeight].a * 0.05;
  return sum;
}

function laplaceB(x, y, grid) {
  const sum = grid[x][y].b * -1 +
    grid[(x + 1) % gridWidth][y].b * 0.2 +
    grid[(x - 1 + gridWidth) % gridWidth][y].b * 0.2 +
    grid[x][(y + 1) % gridHeight].b * 0.2 +
    grid[x][(y - 1 + gridHeight) % gridHeight].b * 0.2 +
    grid[(x + 1) % gridWidth][(y + 1) % gridHeight].b * 0.05 +
    grid[(x - 1 + gridWidth) % gridWidth][(y - 1 + gridHeight) % gridHeight].b * 0.05 +
    //problem could be with the line below after 1.
    grid[(x + 1) % gridWidth][(y - 1 + gridHeight) % gridHeight].b * 0.05 +
    grid[(x - 1 + gridWidth) % gridWidth][(y + 1) % gridHeight].b * 0.05;
  return sum;
}
function updateGrid() {
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      const a = grid[x][y].a;
      const b = grid[x][y].b;
      const la = laplaceA(x, y, grid);
      const lb = laplaceB(x, y, grid);

      const reaction = a * b * b;
      const newA = a + (diffusionRateA * la - reaction + feedRate * (1 - a));
      const newB = b + (diffusionRateB * lb + reaction - (killRate + feedRate) * b);

      nextGrid[x][y].a = newA;
      nextGrid[x][y].b = newB;
    }
  }

  const temp = grid;
  grid = nextGrid;
  nextGrid = temp;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      const intensity = Math.round(grid[x][y].b * 255);
      ctx.fillStyle = 'rgb(${ intensity }, ${ intensity }, ${ intensity })';
      ctx.fillRect(x * scaleX, y * scaleY, scaleX, scaleY);
    }
  }

  updateGrid();
  requestAnimationFrame(draw);
}

draw();