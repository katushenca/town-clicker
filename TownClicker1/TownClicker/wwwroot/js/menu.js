const menuOverlay = document.getElementById("menu-overlay");
const menuTitleText = document.getElementById("menu-title-text");
const menuContent = document.getElementById("menu-content");


async function openMenu(id, userName=null) {
  menuTitleText.textContent = id;
  menuOverlay.style.display = 'flex';
  const grid = document.getElementById('inventory-grid');
  const rankTable = document.getElementById('rating-table');
  if (id === 'Магазин')
    await marketMenu();
  else if (id === 'Инвентарь') {
    document.getElementById('inventory-grid').style.display = 'flex';
    await loadInventory(userName);
  } else if (id === 'Рейтинг') {
    document.getElementById('rating-table').style.display = 'block';
    await loadRank(userName);
  }
}

function closeMenu() {
  menuOverlay.style.display = 'none';
  document.getElementById('inventory-grid').innerHTML = '';
  document.getElementById('rating-table').innerHTML = '';
}

let marketItemLevels;
async function marketMenu() {
  const buildings = [...buildingsData].sort((a, b) => a.initialCost - b.initialCost);
  const levels = await (await fetch("market")).json();
  marketItemLevels = levels.reduce((acc, item) => {
    acc[item.upgradeId] = item.level;
    return acc;
  }, {});
  const container = document.createElement("div");
  container.classList.add('market-list');
  const template = document.getElementById('market-item-template');
  for (const building of buildings) {
    const level = marketItemLevels[building.id] || 0;
    const item = template.content.cloneNode(true).querySelector('.market-item');
    item.id = `market-item-${building.id}`;
    item.class = `market-item-user-level-${building.levelRequired}`;
    item.querySelector('.market-item-level-value').textContent = level;
    item.querySelector('.market-item-img').src = buildingsTextures.buildings[building.id].left[0];
    item.querySelector('.market-item-img').alt = building.name;
    item.querySelector('.market-item-cost-value').textContent = calcCost(building, level);
    item.querySelector('.market-item-info-current-value').textContent = calcEffect(building, level);
    item.querySelector('.market-item-info-next-value').textContent = calcEffect(building, level + 1);
    item.querySelector('.market-item-level-required-value').textContent = building.levelRequired;
    if (currentUserLevel < building.levelRequired) {
      item.querySelector('.market-item-img').classList.add('market-item-img-level-required');
      item.querySelector('.market-item-cost-value').style.display = 'none';
      item.querySelector('.market-item-info').style.display = 'none';
    } else {
      item.querySelector('.market-item-level-required-value').style.display = 'none';
    }
    item.addEventListener('click', () => buyBuilding(building.id));
    container.appendChild(item);
  };
  menuContent.appendChild(container);
}

async function buyBuilding(id) {
  const response = await fetch(`market?upgradeId=${id}`, {
    method: "POST"
  });
  if (response.ok) {
    const building = buildingsData.find(b => b.id === id);
    const level = (marketItemLevels[id] || 0) + 1;
    marketItemLevels[id] = level;
    const item = document.getElementById(`market-item-${id}`);
    item.querySelector('.market-item-level-value').textContent = level;
    item.querySelector('.market-item-cost-value').textContent = calcCost(building, level);
    item.querySelector('.market-item-info-current-value').textContent = calcEffect(building, level);
    item.querySelector('.market-item-info-next-value').textContent = calcEffect(building, level + 1);
    builder.addBuilding(id);
    const json = await response.json();
    document.getElementById('coin-count').textContent = json.money;
    document.getElementById('click-count').textContent = json.popularity;
    const isLevelUp = await updateLevel(json.popularity);
    if (isLevelUp) {
      const newBuildings = document.getElementsByClassName(`market-item-user-level-${currentUserLevel}`);
      for (const newBuilding of newBuildings) {
        newBuilding.querySelector('.market-item-img').classList.remove('market-item-img-level-required');
        newBuilding.querySelector('.market-item-cost-value').style.display = 'block';
        newBuilding.querySelector('.market-item-info').style.display = 'block';
        newBuilding.querySelector('.market-item-level-required-value').style.display = 'none';
      }
    }
  }
}

function calcCost(building, level) {
  const initialCost = building.initialCost;
  const costMultiplier = building.costMultiplier;
  const cost = Math.floor(initialCost * Math.pow(costMultiplier, level));
  return cost;
}

function calcEffect(building, level) {
  const effectType = building.effectType;
  const effectValue = building.effectValue;
  const effect = effectValue * level;
  switch (effectType) {
    case 'Flat':
      return Math.floor(effect).toString();
    case 'Mult':
      return Math.floor(effect * 100).toString() + '%';
  }
}

async function loadInventory(userName) {
  const response = await fetch(`/api/inventory/${userName}`);
  const items = await response.json();
  const grid = document.getElementById('inventory-grid');
  grid.innerHTML = '';
  items.forEach(item => {
    console.log(item.skinId)
    const div = document.createElement('div');
    div.className = 'inventory-item';
    div.innerHTML = `
        <button class="improvement" onclick="useImprovement(this, '${userName}', ${item.skinId})">
         <img src="${item.url}" alt="${item.skinName}">
            <div class="item-name">${item.skinName}</div>
        </button>
    `;
    grid.appendChild(div);
  });
  await animateItems()
}

async function loadRank(userName, type='money') {
  const response = await fetch(`/api/rank/statistics/${type}`);
  const items = await response.json();
  const table = document.getElementById('rating-table');
  table.innerHTML = '';
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = ['Место', 'Имя', type === 'money' ? 'Деньги' : 'Клики'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  items.forEach((item, index) => {
    const row = document.createElement('tr');
    const placeCell = document.createElement('td');
    placeCell.textContent = index + 1;
    row.appendChild(placeCell);
    const nameCell = document.createElement('td');
    nameCell.textContent = item.username;
    row.appendChild(nameCell);
    const dataCell = document.createElement('td');
    dataCell.textContent = item.data;
    row.appendChild(dataCell);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
}

async function animateItems(){
  const userItems = document.querySelectorAll('.inventory-item');
  userItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.classList.add('highlight');
    });
    item.addEventListener('mouseleave', () => {
      item.classList.remove('highlight');
    });
  });
}

async function useImprovement(buttonElement, username, skinId) {
  buttonElement.closest('.inventory-item')?.remove();
  const response = await fetch(`/api/inventory/${username}/${skinId}`);
  const improvementData = await response.json();
  console.log(improvementData);
  showUpgradeNotification(improvementData);
}

function showUpgradeNotification(improvementData) {
  const div = document.getElementById('header-center')
  const notification = document.getElementById('upgrade-notification');
  const timerText = document.getElementById('upgrade-timer');
  const upgradeName = document.getElementById('upgrade-name');
  const progressBar = document.getElementById('upgrade-progress');
  const image = document.getElementById('upgrade-image');
  console.log(`${improvementData.endsAt} дада`);
  let remaining = Math.floor((new Date(improvementData.endsAt).getTime() - Date.now()) / 1000);
  console.log(improvementData.name)
  div.style.display = 'flex';
  timerText.textContent = remaining;
  progressBar.style.width = '0%';
  upgradeName.textContent = `"${improvementData.name[0].toUpperCase() + improvementData.name.slice(1)}"`;
  image.src = improvementData.image;

  const interval = setInterval(() => {
    remaining--;
    timerText.textContent = remaining;
    const progress = ((improvementData.duration - remaining) / improvementData.duration) * 100;
    progressBar.style.width = `${progress}%`;

    if (remaining <= 0) {
      clearInterval(interval);
      div.style.display = 'none';
    }
  }, 1000);
}

async function reload() {
  await window.addEventListener("load", function () {
    console.log("Страница загружена — выполняем код");
    checkUpgradeStatus();
  });
}
async function checkUpgradeStatus() {
  const response = await fetch('/api/upgrade/status');
  const data = await response.json();
  console.log('мяу')
  if (data.isActive) {
    console.log('активен')
    showUpgradeNotification(data);
  }
}
reload()