export class CityRenderer {
  constructor(engine, centerX, centerY) {
    this._engine = engine;
    this._centerX = centerX;
    this._centerY = centerY;
  }

  setBounds(bounds) {
    const renderer = this;
    this._engine.setBounds({
      get minX() { return bounds.minX / 2 + renderer._centerX; },
      get maxX() { return bounds.maxX / 2 + renderer._centerX; },
      get minY() { return bounds.minY / 2 + renderer._centerY; },
      get maxY() { return bounds.maxY / 2 + renderer._centerY; }
    });
  }

  placeSprite(x, y, url, scale = 1, offsetX = 0, offsetY = 0, replace = false, isBuilding = false) {
    this._engine.placeSprite(x + this._centerX, y + this._centerY, url, scale, offsetX, offsetY, replace, isBuilding);
  }
}
