const CHUNK_WIDTH = 3;
const CHUNK_HEIGHT = 2;
const CITY_RADIUS = 2;
const BOUNDS_SIZE = 3;

const ZOOM_INITIAL_SCALE = 1;
const ZOOM_MIN_SCALE = 0.75;
const ZOOM_MAX_SCALE = 2.25;
const ZOOM_FACTOR = 0.001;

const LARGE_VEGETATIONS_DENSITY = 0.05;
const SMALL_VEGETATIONS_DENSITY = 0.15;
const LARGE_VEGETATIONS_SCALE = 0.6;
const SMALL_VEGETATIONS_SCALE = 0.15;
const BUILDINGS_SCALE = 0.75;

class CityGenerator {
  constructor(seed, maxRadius) {
    this._seed = seed;
    this._maxRadius = maxRadius;
    this._gridRnd = new SeedRandom(`grid$${seed}`);
    this._radius = 0;
    this._queue = [[0, 0]];
  }

  generateNextChunk() {
    const chunk = this._nextChunkPosition();
    if (chunk === null) {
      return null;
    }
    const [chunkGridX, chunkGridY] = chunk;
    const [chunkX, chunkY, chunkW, chunkH] = [chunkGridX * (CHUNK_WIDTH + 1) + 1, chunkGridY * (CHUNK_HEIGHT + 1) + 1, CHUNK_WIDTH, CHUNK_HEIGHT];
    const chunkRnd = new SeedRandom(`chunk$${chunkGridX}$${chunkGridY}$${this._seed}`);
    const buildings = [];
    for (let i = 0; i < chunkW; i++) {
      for (let j = 0; j < chunkH; j++) {
        const x = chunkX + i;
        const y = chunkY + j;
        let side = chunkRnd.random() < 0.5 ? 'left' : 'right';
        const isH = i === 0 || j === chunkH - 1;
        const isV = j === 0 || i === chunkW - 1;
        if (isH && !isV && side === 'right') {
          side = 'left';
        }
        if (!isH && isV && side === 'left') {
          side = 'right';
        }
        const state = chunkRnd.random();
        let roadDist = i;
        let road = this._generateRoadId(chunkGridX, chunkGridY, 'left');
        if (j < roadDist) {
          roadDist = j;
          road = this._generateRoadId(chunkGridX, chunkGridY, 'right');
        }
        if (chunkW - i - 1 <= roadDist) {
          roadDist = chunkW - i - 1;
          road = this._generateRoadId(chunkGridX + 1, chunkGridY, 'left');
        }
        if (chunkH - j - 1 < roadDist) {
          road = this._generateRoadId(chunkGridX, chunkGridY + 1, 'right');
        }
        buildings.push({ x, y, side, state, road });
      }
    }
    chunkRnd.shuffleArray(buildings);
    const roads = new Map();
    roads.set(...this._generateRoad(chunkGridX, chunkGridY, 'left', chunkX - 1, chunkY - 1, 0, 1, chunkH + 2));
    roads.set(...this._generateRoad(chunkGridX, chunkGridY, 'right', chunkX - 1, chunkY - 1, 1, 0, chunkW + 2));
    roads.set(...this._generateRoad(chunkGridX + 1, chunkGridY, 'left', chunkX + chunkW, chunkY - 1, 0, 1, chunkH + 2));
    roads.set(...this._generateRoad(chunkGridX, chunkGridY + 1, 'right', chunkX - 1, chunkY + chunkH, 1, 0, chunkW + 2));
    return { buildings, roads };
  }

  _generateRoadId(x, y, side) {
    return `${x}:${y}:${side}`;
  }

  _generateRoad(x, y, side, sx, sy, dx, dy, len) {
    const id = this._generateRoadId(x, y, side);
    const cells = [];
    for (let i = 0; i < len; i++) {
      cells.push([sx + i * dx, sy + i * dy]);
    }
    let prev = null;
    let nodeX, nodeY;
    if (side === 'left') {
      nodeX = x;
      nodeY = y < 0 ? y + 1 : y;
    } else {
      nodeX = x < 0 ? x + 1 : x;
      nodeY = y;
    }
    if (nodeX !== 0 || nodeY !== 0) {
      if (Math.abs(nodeX) < Math.abs(nodeY) || Math.abs(nodeX) === Math.abs(nodeY) && nodeX > nodeY) {
        prev = this._generateRoadId(nodeX, nodeY < 0 ? nodeY : nodeY - 1, 'left');
      } else {
        prev = this._generateRoadId(nodeX < 0 ? nodeX : nodeX - 1, nodeY, 'right');
      }
    }
    return [id, { cells, prev }];
  }

  _nextChunkPosition() {
    if (this._queue.length === 0) {
      if (this._radius >= this._maxRadius) {
        return null;
      }
      this._radius++;
      for (let i = -this._radius; i < this._radius; i++) {
        this._queue.push([i, -this._radius]);
        this._queue.push([this._radius, i]);
        this._queue.push([-i, this._radius]);
        this._queue.push([-this._radius, -i]);
      }
      this._gridRnd.shuffleArray(this._queue);
    }
    return this._queue.shift();
  }
}

class CityBuilder {
  constructor(buildingsData, renderer, seed, maxRadius, boundsSize) {
    this._buildingsData = buildingsData;
    this._buildingsData.buildings = [...this._buildingsData.buildings].sort((a, b) => a.id - b.id);
    this._renderer = renderer;
    this._seed = seed;
    this._chunkRandomizer = new CityGenerator(this._seed, maxRadius);
    this._roadsInPlan = new Map();
    this._roads = new Set();
    this._roadTiles = new Set();
    this._buildingCosts = [];
    this._buildQueues = {};
    this._boundsSize = boundsSize;
    this._bounds = { minX: -boundsSize, maxX: boundsSize, minY: -boundsSize, maxY: boundsSize };
    this._renderer.setBounds(this._bounds);
    this._vegitationsChunkSize = 10;
    this._vegitationsChunks = new Set();
    this._vegetationsMap = new Map();

    for (const building of this._buildingsData.buildings) {
      this._buildQueues[building.id] = [];
      this._buildingCosts.push({ cost: building.initialCost, mult: building.costMultiplierPerLevel, id: building.id });
    }

    for (let i = -boundsSize; i <= boundsSize; i++) {
      for (let j = -boundsSize; j <= boundsSize; j++) {
        this._placeGrass(i, j);
      }
    }
  }

  _placeGrass(x, y) {
    this._renderer.placeSprite(x, y, this._buildingsData.grass);
    const chunkX = Math.floor(x / this._vegitationsChunkSize);
    const chunkY = Math.floor(y / this._vegitationsChunkSize);
    if (!this._vegitationsChunks.has(`${chunkX}:${chunkY}`)) {
      this._generateVegetationsChunk(chunkX, chunkY);
    }
    const vegetation = this._vegetationsMap.get(`${x}:${y}`);
    if (!vegetation) {
      return;
    }
    this._renderer.placeSprite(x, y, ...vegetation);
  }

  _generateVegetationsChunk(chunkX, chunkY) {
    const rnd = new SeedRandom(`vegetations$${chunkX}$${chunkY}$${this._seed}`);
    const largeDensity = LARGE_VEGETATIONS_DENSITY;
    const smallDensity = SMALL_VEGETATIONS_DENSITY;
    const density = largeDensity + smallDensity;
    const x = chunkX * this._vegitationsChunkSize;
    const y = chunkY * this._vegitationsChunkSize;
    const smallCount = this._buildingsData.vegetations.small.length;
    const largeCount = this._buildingsData.vegetations.large.length;
    for (let i = 0; i < this._vegitationsChunkSize; i++) {
      for (let j = 0; j < this._vegitationsChunkSize; j++) {
        const state = rnd.random();
        if (state >= density) {
          continue;
        }
        if (state < largeDensity) {
          const scale = rnd.randFloat(0.8, 1.2) * LARGE_VEGETATIONS_SCALE;
          const offsetX = rnd.randFloat(-3, 3);
          const offsetY = rnd.randFloat(-3, 3);
          this._vegetationsMap.set(`${x + i}:${y + j}`,
            [this._buildingsData.vegetations.large[Math.floor(state / density * largeCount)], scale, offsetX, offsetY]);
        } else {
          const scale = rnd.randFloat(0.8, 1.2) * SMALL_VEGETATIONS_SCALE;
          const offsetX = rnd.randFloat(-5, 9);
          const offsetY = rnd.randFloat(7, 21);
          this._vegetationsMap.set(`${x + i}:${y + j}`,
            [this._buildingsData.vegetations.small[Math.floor(state / density * smallCount)], scale, offsetX, offsetY]);
        }
      }
    }
    this._vegitationsChunks.add(`${chunkX}:${chunkY}`);
  }

  _expandBounds(x, y) {
    if (x - this._boundsSize < this._bounds.minX) {
      x -= this._boundsSize;
      for (let i = this._bounds.minX - 1; i >= x; i--) {
        for (let j = this._bounds.minY; j <= this._bounds.maxY; j++)
          this._placeGrass(i, j);
      }
      this._bounds.minX = x;
    } else if (x + this._boundsSize > this._bounds.maxX) {
      x += this._boundsSize;
      for (let i = this._bounds.maxX + 1; i <= x; i++) {
        for (let j = this._bounds.minY; j <= this._bounds.maxY; j++)
          this._placeGrass(i, j);
      }
      this._bounds.maxX = x;
    }
    if (y - this._boundsSize < this._bounds.minY) {
      y -= this._boundsSize;
      for (let j = this._bounds.minY - 1; j >= y; j--) {
        for (let i = this._bounds.minX; i <= this._bounds.maxX; i++)
          this._placeGrass(i, j);
      }
      this._bounds.minY = y;
    } else if (y + this._boundsSize > this._bounds.maxY) {
      y += this._boundsSize;
      for (let j = this._bounds.maxY + 1; j <= y; j++) {
        for (let i = this._bounds.minX; i <= this._bounds.maxX; i++)
          this._placeGrass(i, j);
      }
      this._bounds.maxY = y;
    }
  }

  _generateNextChunk() {
    const chunk = this._chunkRandomizer.generateNextChunk();
    if (chunk === null) {
      return false;
    }
    const { buildings, roads } = chunk;
    for (const building of buildings) {
      let minCost = Number.MAX_VALUE;
      let minId = -1;
      let minI = -1;
      for (const [i, cost] of this._buildingCosts.entries()) {
        if (cost.cost < minCost) {
          minCost = cost.cost;
          minId = cost.id;
          minI = i;
        }
      }
      this._buildingCosts[minI].cost *= this._buildingCosts[minI].mult;
      this._buildQueues[minId].push(building);
    }
    for (const [roadId, road] of roads) {
      if (!this._roads.has(roadId)) {
        this._roadsInPlan.set(roadId, road);
      }
    }
    return true;
  }

  _addRoadPath(roadId) {
    if (this._roads.has(roadId)) {
      return [];
    }
    const road = this._roadsInPlan.get(roadId);
    if (road === undefined) {
      return [];
    }
    this._roadsInPlan.delete(roadId);
    this._roads.add(roadId);
    const result = [];
    for (const cell of road.cells) {
      if (!this._roadTiles.has(`${cell[0]}:${cell[1]}`)) {
        result.push(cell);
      }
    }
    if (road.prev) {
      result.push(...this._addRoadPath(road.prev));
    }
    return result;
  }

  addBuilding(id) {
    if (this._buildQueues[id] === undefined)
      return;
    while (this._buildQueues[id].length === 0) {
      if (!this._generateNextChunk()) {
        return;
      }
    }
    const building = this._buildQueues[id].shift();
    const textures = this._buildingsData.buildings[id].textures[building.side];
    const sprite = textures[Math.floor(building.state * textures.length)];
    const roads = this._addRoadPath(building.road);
    const roadsToUpdateSet = new Set();
    const roadsToUpdate = [];
    const deltas = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (const cell of roads) {
      const key = `${cell[0]}:${cell[1]}`;
      this._roadTiles.add(key);
      if (!roadsToUpdateSet.has(key)) {
        roadsToUpdateSet.add(key);
        roadsToUpdate.push([cell[0], cell[1]]);
      }
      for (const [dx, dy] of deltas) {
        const key = `${cell[0] + dx}:${cell[1] + dy}`;
        if (!roadsToUpdateSet.has(key) && this._roadTiles.has(key)) {
          roadsToUpdateSet.add(key);
          roadsToUpdate.push([cell[0] + dx, cell[1] + dy]);
        }
      }
    }
    for (const roadCell of roadsToUpdate) {
      const [x, y] = roadCell;
      const spriteKey = `${Number(this._roadTiles.has(`${x - 1}:${y}`))}${Number(this._roadTiles.has(`${x}:${y + 1}`))}${Number(this._roadTiles.has(`${x + 1}:${y}`))}${Number(this._roadTiles.has(`${x}:${y - 1}`))}`;
      this._expandBounds(x, y);
      this._renderer.placeSprite(x, y, this._buildingsData.roads[spriteKey], 1, 0, 0, true);
    }
    this._renderer.placeSprite(building.x, building.y, this._buildingsData.grass, 1, 0, 0, true);
    this._renderer.placeSprite(building.x, building.y, sprite, BUILDINGS_SCALE, 5, 4);
  }

  addBuildings(...ids) {
    for (const id of ids) {
      this.addBuilding(id);
    }
  }
}

class CityRenderer {
  constructor(engine, centerX, centerY) {
    this._engine = engine;
    this._centerX = centerX;
    this._centerY = centerY;
  }

  setBounds(bounds) {
    const renderer = this;
    this._engine.setBounds({
      get minX() { return bounds.minX / 2 + renderer._centerX },
      get maxX() { return bounds.maxX / 2 + renderer._centerX },
      get minY() { return bounds.minY / 2 + renderer._centerY },
      get maxY() { return bounds.maxY / 2 + renderer._centerY }
    });
  }

  placeSprite(x, y, url, scale = 1, offsetX = 0, offsetY = 0, replace = false) {
    this._engine.placeSprite(x + this._centerX, y + this._centerY, url, scale, offsetX, offsetY, replace);
  }

  renderDebugCity() {
    for (let i = 0; i < 17; i++)
      for (let j = 0; j < 21; j++) {
        if (i % 4 != 0 && j % 4 != 0)
          this._engine.placeSprite(35 + i, 35 + j, "images/floors/ground_grass.png");
        else if (i % 4 != 0 && j % 4 == 0)
          this._engine.placeSprite(35 + i, 35 + j, "images/floors/road_straight_b.png");
        else if (i % 4 == 0 && j % 4 != 0)
          this._engine.placeSprite(35 + i, 35 + j, "images/floors/road_straight_a.png");
        else if (i % 4 == 0 && j % 4 == 0)
          this._engine.placeSprite(35 + i, 35 + j, "images/floors/road_xing.png");
      }

    let list = ["auto_shop_a.png", "auto_shop_b.png", "barber_shop_a.png", "barber_shop_b.png", "building_medium_blue_a.png", "building_medium_blue_b.png", "building_medium_green_a.png", "building_medium_green_b.png", "building_medium_white_a.png", "building_medium_white_b.png", "building_small_brown_a.png", "building_small_brown_b.png", "building_small_gray_a.png", "building_small_gray_b.png", "building_small_red_a.png", "building_small_red_b.png", "building_tall_blue_a.png", "building_tall_blue_b.png", "building_tall_yellow_a.png", "building_tall_yellow_b.png", "cafe_a.png", "cafe_b.png", "church_a.png", "church_b.png", "fire_station_a.png", "fire_station_b.png", "gas_station_a.png", "gas_station_b.png", "hospital_a.png", "hospital_b.png", "house_large_brown_a.png", "house_large_brown_b.png", "house_large_green_a.png", "house_large_green_b.png", "house_large_teal_a.png", "house_large_teal_b.png", "house_medium_brown_a.png", "house_medium_brown_b.png", "house_medium_gray_a.png", "house_medium_gray_b.png", "house_medium_white_a.png", "house_medium_white_b.png", "house_small_blue_a.png", "house_small_blue_b.png", "house_small_purple_a.png", "house_small_purple_b.png", "house_small_yellow_a.png", "house_small_yellow_b.png", "police_station_a.png", "police_station_b.png", "warehouse_maroon_a.png", "warehouse_maroon_b.png", "warehouse_orange_a.png", "warehouse_orange_b.png"];
    let id = 0;
    a: for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        if (i % 4 == 0) i++;
        if (j % 4 == 0) j++;
        this._engine.placeSprite(39 + i, 39 + j, `images/buildings/${list[id++]}`, 0.75, 5, 4);
        if (id >= list.length)
          break a;
      }
    }
  }
}

class GridEngine {
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

  placeSprite(x, y, url, scale = 1, offsetX = 0, offsetY = 0, replace = false) {
    const cell = this._cells[y]?.[x];
    if (!cell) {
      return;
    }
    if (replace) {
      cell.replaceChildren();
    }
    let sprite = document.createElement("div");
    sprite.classList.add("sprite");
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

class SeedRandom {
  constructor(seed) {
    this._seed = typeof seed === 'string' ? SeedRandom._stringToSeed(seed) : seed;
    this._rng = SeedRandom._mulberry32(this._seed);
  }

  random() {
    return this._rng();
  }

  randFloat(a, b) {
    return this.random() * (b - a) + a;
  }

  randInt(a, b) {
    return Math.floor(this.randFloat(a, b));
  }

  shuffleArray(array) {
    const len = array.length - 2;
    for (let i = 0; i < len; i++) {
      const j = this.randInt(i, len);
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  static _mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  static _stringToSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

let builder;
let buildingsData;
async function init() {
  const response = await fetch("data/buildings.json");
  buildingsData = await response.json();
  const width = (CITY_RADIUS * 2 + 1) * (CHUNK_WIDTH + 1) + BOUNDS_SIZE * 2 + 1;
  const height = (CITY_RADIUS * 2 + 1) * (CHUNK_HEIGHT + 1) + BOUNDS_SIZE * 2 + 1;
  const engine = new GridEngine(width, height);
  const renderer = new CityRenderer(engine, Math.floor(width / 2) - Math.ceil((CHUNK_WIDTH + 1) / 2), Math.floor(height / 2) - Math.ceil((CHUNK_HEIGHT + 1) / 2));
  builder = new CityBuilder(buildingsData, renderer, "USERNAME", CITY_RADIUS, BOUNDS_SIZE);
  const levels = await (await fetch("market")).json();
  for (const { upgradeId, level } of levels) {
    for (let i = 0; i < level; i++) {
      builder.addBuilding(upgradeId);
    }
  }
  /*setInterval(() => {
    const rndId = 13 - Math.floor(Math.pow(Math.random() * Math.pow(14, 4), 1 / 4));
    builder.addBuilding(rndId);
  }, 10);*/
}
init();
