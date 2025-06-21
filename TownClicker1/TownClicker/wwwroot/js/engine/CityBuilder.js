import { CityGenerator } from "./CityGenerator.js";
import { SeedRandom } from "./SeedRandom.js";

const LARGE_VEGETATIONS_DENSITY = 0.05;
const SMALL_VEGETATIONS_DENSITY = 0.15;
const LARGE_VEGETATIONS_SCALE = 0.6;
const SMALL_VEGETATIONS_SCALE = 0.15;
const BUILDINGS_SCALE = 0.75;

export class CityBuilder {
  constructor(buildingsData, buildingsTextures, renderer, seed, chunkWidth, chunkHeight, maxRadius, boundsSize) {
    this._buildingsData = buildingsData;
    this._buildingsTextures = buildingsTextures;
    this._renderer = renderer;
    this._seed = seed;
    this._chunkRandomizer = new CityGenerator(this._seed, maxRadius, chunkWidth, chunkHeight);
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

    for (const building of this._buildingsData) {
      this._buildQueues[building.id] = [];
      this._buildingCosts.push({ cost: building.initialCost, mult: building.costMultiplier, id: building.id });
    }

    for (let i = -boundsSize; i <= boundsSize; i++) {
      for (let j = -boundsSize; j <= boundsSize; j++) {
        this._placeGrass(i, j);
      }
    }
  }

  _placeGrass(x, y) {
    this._renderer.placeSprite(x, y, this._buildingsTextures.grass);
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
    const smallCount = this._buildingsTextures.vegetations.small.length;
    const largeCount = this._buildingsTextures.vegetations.large.length;
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
            [this._buildingsTextures.vegetations.large[Math.floor(state / density * largeCount)], scale, offsetX, offsetY]);
        } else {
          const scale = rnd.randFloat(0.8, 1.2) * SMALL_VEGETATIONS_SCALE;
          const offsetX = rnd.randFloat(-5, 9);
          const offsetY = rnd.randFloat(7, 21);
          this._vegetationsMap.set(`${x + i}:${y + j}`,
            [this._buildingsTextures.vegetations.small[Math.floor(state / density * smallCount)], scale, offsetX, offsetY]);
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
    const textures = this._buildingsTextures.buildings[id][building.side];
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
      this._renderer.placeSprite(x, y, this._buildingsTextures.roads[spriteKey], 1, 0, 0, true);
    }
    this._renderer.placeSprite(building.x, building.y, this._buildingsTextures.grass, 1, 0, 0, true);
    this._renderer.placeSprite(building.x, building.y, sprite, BUILDINGS_SCALE, 5, 4, false, true);
  }

  addBuildings(...ids) {
    for (const id of ids) {
      this.addBuilding(id);
    }
  }
}
