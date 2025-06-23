import { SeedRandom } from "./SeedRandom.js";

export class CityGenerator {
    constructor(seed, maxRadius, chunkWidth, chunkHeight) {
        this._seed = seed;
        this._maxRadius = maxRadius;
        this._chunkWidth = chunkWidth;
        this._chunkHeight = chunkHeight;
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
        const [chunkX, chunkY, chunkW, chunkH] = [chunkGridX * (this._chunkWidth + 1) + 1,
          chunkGridY * (this._chunkHeight + 1) + 1, this._chunkWidth, this._chunkHeight];
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
