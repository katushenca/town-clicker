const intValueStr = "KMBTqQsSO";
export function bigintToString(value) {
    if (value < 1000) {
        return value;
    }
    value /= 1000;
    let n = 0;
    for (; n + 1 < intValueStr.length && value >= 100; n++) {
        value /= 1000;
    }
    return `${Math.round(value * 100) / 100}${intValueStr[n]}`;
}
