export class SeedRandom {
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
      seed = seed + 1831565813 | 0;
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
