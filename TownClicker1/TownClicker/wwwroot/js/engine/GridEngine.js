const ZOOM_INITIAL_SCALE = 1;
const ZOOM_MIN_SCALE = 0.75;
const ZOOM_MAX_SCALE = 2.25;
const ZOOM_FACTOR = 0.001;

export class GridEngine {
  constructor(width, height) {
    this._width = width;
    this._height = height;
    this._gridContainer = document.getElementById("grid-container");
    this._gridWrapper = document.getElementById("grid-wrapper");
    this._grid = document.getElementById("grid");
    this._grid.style.width = `${64 * width}px`;
    this._grid.style.height = `${64 * height}px`;
    this._grid.style.gridTemplateColumns = `repeat(${width}, 64px)`;
    this._grid.style.gridTemplateRows = `repeat(${height}, 64px)`;
    this._isDragging = false;
    this._startX = 0;
    this._startY = 0;
    this._offsetX = 0;
    this._offsetY = 0;
    this._scale = ZOOM_INITIAL_SCALE;
    this.createGrid(height, width);
    this.addEvents();
    this.centerGrid();
  }

  createGrid(rows, cols) {
    grid.innerHTML = "";
    const cells = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        const container = document.createElement("div");
        container.classList.add("sprite-container");
        cell.appendChild(container);
        grid.appendChild(cell);
        row.push(container);
      }
      cells.push(row);
    }
    this._cells = cells;
  }

  addEvents() {
    this._gridContainer.addEventListener("mousedown", (e) => {
      this._isDragging = true;
      this._startX = (e.clientX - this._offsetX) / this._scale;
      this._startY = (e.clientY - this._offsetY) / this._scale;
    });

    this._gridContainer.addEventListener("mousemove", (e) => {
      if (!this._isDragging) return;
      this._offsetX = e.clientX - this._startX * this._scale;
      this._offsetY = e.clientY - this._startY * this._scale;
      this.checkBounds();
      this.updateTransform();
    });

    this._gridContainer.addEventListener("mouseup", () => this._isDragging = false);
    this._gridContainer.addEventListener("mouseleave", () => this._isDragging = false);

    this._gridContainer.addEventListener("wheel", (e) => {
      e.preventDefault();

      const rect = this._gridContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const gridX = (mouseX - this._offsetX) / this._scale;
      const gridY = (mouseY - this._offsetY) / this._scale;

      const delta = -e.deltaY;

      const newScale = this._scale * (1 + delta * ZOOM_FACTOR);
      this._scale = Math.max(ZOOM_MIN_SCALE, Math.min(ZOOM_MAX_SCALE, newScale));

      this._offsetX = mouseX - gridX * this._scale;
      this._offsetY = mouseY - gridY * this._scale;

      this.checkBounds();
      this.updateTransform();
    });
  }

  centerGrid() {
    const containerRect = this._gridContainer.getBoundingClientRect();
    const gridWrapperRect = this._gridWrapper.getBoundingClientRect();
    this._offsetX = (containerRect.width - gridWrapperRect.width) / 2 * this._scale;
    this._offsetY = (containerRect.height - gridWrapperRect.height) / 2 * this._scale;
    this.updateTransform();
  }

  placeSprite(x, y, url, scale = 1, offsetX = 0, offsetY = 0, replace = false, isBuilding = false) {
    const cell = this._cells[y]?.[x];
    if (!cell) {
      return;
    }
    if (replace) {
      cell.replaceChildren();
    }
    let sprite = document.createElement("div");
    sprite.classList.add("sprite");
    if (isBuilding) {
      sprite.id = "building";
    }
    sprite.style.backgroundImage = `url('${url}')`;
    sprite.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    cell.appendChild(sprite);
  }

  setBounds(bounds) {
    this._bounds = bounds;
  }

  checkBounds() {
    if (!this._bounds) {
      return;
    }
    const containerRect = this._gridContainer.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    const gridCenterX = (centerX - this._offsetX) / this._scale / 64;
    const gridCenterY = (centerY - this._offsetY) / this._scale / 64;
    const { minX, maxX, minY, maxY } = this._bounds;
    if (gridCenterX < minX) {
      this._offsetX = centerX - minX * 64 * this._scale;
    }
    if (gridCenterX > maxX) {
      this._offsetX = centerX - maxX * 64 * this._scale;
    }
    if (gridCenterY < minY) {
      this._offsetY = centerY - minY * 64 * this._scale;
    }
    if (gridCenterY > maxY) {
      this._offsetY = centerY - maxY * 64 * this._scale;
    }
  }

  updateTransform() {
    this._gridWrapper.style.transform = `translate(${this._offsetX}px, ${this._offsetY}px) scale(${this._scale})`;
  }
}
