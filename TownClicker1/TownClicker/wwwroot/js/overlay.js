let levelsData;
let currentUserLevel = 0;
let currentTotalMoney = 0;

function updateMoney(money) {
  currentTotalMoney = money;
  const moneyLabel = document.getElementById('money-count');
  moneyLabel.textContent = bigintToString(money);
}

const intValueStr = "KMBTqQsSO";
function bigintToString(value) {
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

function updatePopulationAndLevel(population) {
  let level = levelsData.findIndex((value) => value > population);
  if (level === -1) {
    level = levelsData.length - 1;
  }
  else {
    level--;
  }
  const nextLevelPopulation = levelsData[level + 1] || levelsData[level];

  const populationLabel = document.getElementById('population-count');
  populationLabel.textContent = population;
  const levelLabel = document.getElementById("level-value");
  levelLabel.textContent = level.toString();
  const levelProgress = document.getElementById("progress-bar-value");
  levelProgress.style.width = `${Math.min((population / nextLevelPopulation) * 100, 100)}%`;

  const isLevelUp = currentUserLevel < level;
  currentUserLevel = level;
  return isLevelUp;
}

async function init() {
  levelsData = await (await fetch("market/levels")).json();

  const statistics = await (await fetch('api/Statistics')).json();
  updateMoney(statistics.money);
  updatePopulationAndLevel(statistics.popularity);
}
init();
