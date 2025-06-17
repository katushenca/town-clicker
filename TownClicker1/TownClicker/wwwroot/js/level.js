let levelsData;
let currentUserLevel = 0;

async function updateLevel(population) {
  levelsData ??= await (await fetch("market/levels")).json();
  // levelsData = "[0, 5, 25, ..]"
  const level = levelsData.findIndex((value) => value > population);
  if (level === -1) {
    level = levelsData.length - 1;
  }
  const levelElement = document.getElementById("level-value");
  levelElement.textContent = level.toString();
  const levelProgress = document.getElementById("progress-bar-value");
  const nextLevelPopulation = levelsData[level + 1] || levelsData[level];
  levelProgress.style.width = `${(population / nextLevelPopulation) * 100}%`;
  const isLevelUp = currentUserLevel < level;
  currentUserLevel = level;
  return isLevelUp;
}
