let levelsData;
let currentUserLevel = 0;

function updateMoney(money) {
  const moneyLabel = document.getElementById('money-count');
  moneyLabel.textContent = money.toString();
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
