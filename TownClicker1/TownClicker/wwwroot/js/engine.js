import { CityBuilder } from "./CityBuilder.js";
import { CityRenderer } from "./CityRenderer.js";
import { GridEngine } from "./GridEngine.js";
import { overlayState } from "./overlay.js";

const CHUNK_WIDTH = 3;
const CHUNK_HEIGHT = 2;
const CITY_RADIUS = 2;
const BOUNDS_SIZE = 3;

export let buildingsData;
export let buildingsTextures;
export let builder;

async function init() {
  buildingsData = await (await fetch("market/upgrades")).json();
  buildingsData = [...buildingsData].sort((a, b) => a.id - b.id);
  buildingsTextures = await (await fetch("data/buildings.json")).json();
  const width = (CITY_RADIUS * 2 + 1) * (CHUNK_WIDTH + 1) + BOUNDS_SIZE * 2 + 1;
  const height = (CITY_RADIUS * 2 + 1) * (CHUNK_HEIGHT + 1) + BOUNDS_SIZE * 2 + 1;
  const engine = new GridEngine(width, height);
  const renderer = new CityRenderer(engine, Math.floor(width / 2) - Math.ceil((CHUNK_WIDTH + 1) / 2),
    Math.floor(height / 2) - Math.ceil((CHUNK_HEIGHT + 1) / 2));
  builder = new CityBuilder(buildingsData, buildingsTextures, renderer, overlayState.username,
    CHUNK_WIDTH, CHUNK_HEIGHT, CITY_RADIUS, BOUNDS_SIZE);
  const levels = await (await fetch("market")).json();
  for (const { upgradeId, level } of levels) {
    for (let i = 0; i < level; i++) {
      builder.addBuilding(upgradeId);
    }
  }
}
await init();
