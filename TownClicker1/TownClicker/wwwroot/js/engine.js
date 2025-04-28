const gridContainer = document.getElementById("grid-container");
const gridWrapper = document.getElementById("grid-wrapper");
const grid = document.getElementById("grid");
let isDragging = false;
let startX, startY, offsetX = 0, offsetY = 0;
let scale = 2;

function centerGrid() {
  const containerRect = gridContainer.getBoundingClientRect();
  const gridWrapperRect = gridWrapper.getBoundingClientRect();
  offsetX = (containerRect.width - gridWrapperRect.width) / 2;
  offsetY = (containerRect.height - gridWrapperRect.height) / 2;
  updateTransform();
}

function updateTransform() {
  gridWrapper.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

function createGrid(rows, cols) {
  grid.innerHTML = "";
  for (let i = 0; i < rows * cols; i++) {
    let cell = document.createElement("div");
    cell.classList.add("cell");
    cell.addEventListener("dblclick", () => placeSprite(cell));
    placeSprite(cell);
    grid.appendChild(cell);
  }
}

function placeSprite(cell) {
  let sprite = document.createElement("div");
  sprite.classList.add("sprite");
  let sid = Math.floor(Math.pow(Math.random() * Math.sqrt(6), 2));
  if (sid > 0) {
    sid--;
    sprite.style.backgroundImage = `url('images/sprite${sid}.png')`;
    if (sid == 3) {
      sprite.style.width = '96px';
      sprite.style.height = '96px';
      sprite.style.backgroundPositionY = '4px';
      sprite.style.backgroundSize = '32px';
    }
    if (sid == 4) {
      sprite.style.width = '96px';
      sprite.style.height = '96px';
      sprite.style.backgroundPositionY = '24px';
      sprite.style.backgroundSize = '48px';
    }
  }
  cell.innerHTML = "";
  cell.appendChild(sprite);
}

gridContainer.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = (e.clientX - offsetX) / scale;
  startY = (e.clientY - offsetY) / scale;
});

gridContainer.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  offsetX = e.clientX - startX * scale;
  offsetY = e.clientY - startY * scale;
  updateTransform();
});

gridContainer.addEventListener("mouseup", () => isDragging = false);
gridContainer.addEventListener("mouseleave", () => isDragging = false);

gridContainer.addEventListener("wheel", (e) => {
  e.preventDefault();

  const rect = gridContainer.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const imageX = (mouseX - offsetX) / scale;
  const imageY = (mouseY - offsetY) / scale;

  const delta = -e.deltaY;
  const zoomFactor = 0.001;
  const newScale = scale * (1 + delta * zoomFactor);

  const minScale = 0.1;
  const maxScale = 10;
  scale = Math.max(minScale, Math.min(maxScale, newScale));

  offsetX = mouseX - imageX * scale;
  offsetY = mouseY - imageY * scale;

  updateTransform();
});
createGrid(100, 100);
centerGrid();