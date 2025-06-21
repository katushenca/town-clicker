import { builder, buildingsData, buildingsTextures } from './engine.js';
import { overlayState, setTotalMoney, setPopulationAndLevel } from './overlay.js';
import { bigintToString } from './helpers.js';

const bonusValues = {
  5: 100,
  6: 200,
  7: 500,
};
const noTimeImprovements = [5, 6, 7];

const menuOverlay = document.getElementById("menu-overlay");
const menuTitleText = document.getElementById("menu-title-text");


const infoContainer = document.getElementById("info-container");
const infoTitle = document.getElementById("info-title");
const infoText = document.getElementById("info-text");

async function openMenu(id, userName=null) {
  menuTitleText.textContent = id;

  const tooltipData = {
    'Магазин': {
      title: 'О магазине',
      text: `Здесь вы можете купить здания для вашего городка. Чем больше зданий вы покупаете, тем больше население.`
    },
    'Инвентарь': {
      title: 'О инвентаре',
      text: `Здесь хранятся собранные бонусы. Нельзя использовать несколько одновременно.`
    }
  };

  if (tooltipData[id]) {
    infoContainer.classList.remove('hidden');
    infoTitle.textContent = tooltipData[id].title;
    infoText.textContent = tooltipData[id].text;
  } else {
    infoContainer.classList.add('hidden');
  }
  menuOverlay.style.display = 'flex';
  if (id === 'Магазин') {
    document.getElementById('market-list').style.display = 'flex';
    await marketMenu();
  } else if (id === 'Инвентарь') {
    document.getElementById('inventory-grid').style.display = 'flex';
    await loadInventory(userName);
  } else if (id === 'Рейтинг') {
    document.getElementById('tabs').style.display = 'flex';
    await openTab(userName);
  }
}
window.openMenu = openMenu;

window.closeMenu = function closeMenu() {
  menuOverlay.style.display = 'none';
  document.getElementById('inventory-grid').style.display = 'none';
  document.getElementById('market-list').style.display = 'none';
  document.getElementById('inventory-grid').innerHTML = '';
  document.getElementById('market-list').innerHTML = '';
  resetRank();
}
window.closeMenu = closeMenu;

let marketItemLevels;
async function marketMenu() {
  const buildings = [...buildingsData].sort((a, b) => a.initialCost - b.initialCost);
  const levels = await (await fetch("market")).json();
  marketItemLevels = levels.reduce((acc, item) => {
    acc[item.upgradeId] = item.level;
    return acc;
  }, {});
  const container = document.getElementById('market-list');
  const template = document.getElementById('market-item-template');
  for (const building of buildings) {
    const level = marketItemLevels[building.id] || 0;
    const item = template.content.cloneNode(true).querySelector('.market-item');
    item.id = `market-item-${building.id}`;
    item.classList.add(`market-item-user-level-${building.levelRequired}`);
    item.querySelector('.market-item-level-value').textContent = level;
    item.querySelector('.market-item-img').src = buildingsTextures.buildings[building.id].left[0];
    item.querySelector('.market-item-img').alt = building.name;
    item.querySelector('.market-item-cost-value').textContent = bigintToString(calcCost(building, level));
    item.querySelector('.market-item-info-current-value').textContent = calcEffect(building, level);
    item.querySelector('.market-item-info-next-value').textContent = calcEffect(building, level + 1);
    item.querySelector('.market-item-level-required-value').textContent = building.levelRequired;
    if (overlayState.level < building.levelRequired) {
      item.querySelector('.market-item-img').classList.add('market-item-img-level-required');
      item.querySelector('.cost').style.display = 'none';
      item.querySelector('.population').style.display = 'none';
    } else {
      item.classList.add('market-item-available');
      item.querySelector('.market-item-level-required').style.display = 'none';
    }
    item.addEventListener('click', () => buyBuilding(building.id));
    container.appendChild(item);
  }
}

async function buyBuilding(id) {
  const response = await fetch(`market?upgradeId=${id}`, { method: "POST" });
  if (!response.ok) {
    return;
  }
  const building = buildingsData.find(b => b.id === id);
  const level = (marketItemLevels[id] || 0) + 1;
  marketItemLevels[id] = level;
  const item = document.getElementById(`market-item-${id}`);
  item.querySelector('.market-item-level-value').textContent = level;
  item.querySelector('.market-item-cost-value').textContent = bigintToString(calcCost(building, level));
  item.querySelector('.market-item-info-current-value').textContent = calcEffect(building, level);
  item.querySelector('.market-item-info-next-value').textContent = calcEffect(building, level + 1);
  builder.addBuilding(id);
  const json = await response.json();
  setTotalMoney(json.money);
  const isLevelUp = setPopulationAndLevel(json.popularity);
  if (!isLevelUp) {
    return;
  }
  for (let i = 1; i <= overlayState.level; i++) {
    const newBuildings = document.getElementsByClassName(`market-item-user-level-${i}`);
    for (const newBuilding of newBuildings) {
      newBuilding.classList.add('market-item-available');
      newBuilding.querySelector('.market-item-img').classList.remove('market-item-img-level-required');
      newBuilding.querySelector('.cost').style.display = 'flex';
      newBuilding.querySelector('.population').style.display = 'flex';
      newBuilding.querySelector('.market-item-level-required').style.display = 'none';
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
  const upgradeResponse = await fetch('/api/upgrade/status');
  const activeUpgrade = await upgradeResponse.json();
  
  const items = await response.json();
  const grid = document.getElementById('inventory-grid');
  const buttonClass = activeUpgrade.isActive && !noTimeImprovements.includes(Number(activeUpgrade.id))  ? 'improvement disabled' : 'improvement';
  const disabledAttr = activeUpgrade.isActive && !noTimeImprovements.includes(Number(activeUpgrade.id)) ? 'disabled' : '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'inventory-item';
    div.innerHTML = `
        <button class="${buttonClass}"  ${disabledAttr} onclick="useImprovement(this, '${userName}', ${item.skinId})">
         <img src="${item.url}" alt="${item.skinName}">
            <div class="item-name">${item.skinName}</div>
        </button>
    `;
    grid.appendChild(div);
  });
  await animateItems()
}

function resetRank() {
  document.getElementById(`popularity-tab`).classList.remove('active');
  document.getElementById(`clicks-tab`).classList.remove('active');
  document.getElementById('popularity').innerHTML = '';
  document.getElementById('clicks').innerHTML = '';
  document.getElementById('popularity').style.display = 'none';
  document.getElementById('clicks').style.display = 'none';
  document.getElementById('tabs').style.display = 'none';
}

async function openTab(userName, tableId='popularity') {
  if (document.getElementById(`${tableId}-tab`).classList.contains('active')) {
    return;
  }
  const other = tableId === 'popularity' ? 'clicks' : 'popularity';
  document.getElementById(other).innerHTML = '';
  document.getElementById(other).style.display = 'none';
  document.getElementById(tableId).style.display = 'block';
  document.getElementById(`${other}-tab`).classList.remove('active');
  document.getElementById(`${tableId}-tab`).classList.add('active');
  await loadRank(userName, tableId);
}
window.openTab = openTab;

async function loadRank(userName, type='popularity') {
  const response = await fetch(`/api/rank/statistics/${type}`);
  const items = await response.json();

  const person = await fetch(`/api/rank/statistics/${userName}`);
  const person_items =  await person.json();
  let user_place = '-';
  
  const table = document.getElementById(type);
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = ['Место', 'Имя', type === 'popularity' ? 'Население' : 'Клики'];
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
    if (item.id === person_items.id) {
      row.classList.add('highlight');
      user_place = `${index + 1}`;
    }
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

  const tfoot = document.createElement('tfoot');
  const footerRow = document.createElement('tr');
  footerRow.classList.add('user-footer');
  const placeFooterCell = document.createElement('td');
  placeFooterCell.textContent = user_place;
  const nameFooterCell = document.createElement('td');
  nameFooterCell.textContent = userName;
  const dataFooterCell = document.createElement('td');
  dataFooterCell.textContent = type === 'popularity' ? person_items.popularity : person_items.clicks;
  footerRow.appendChild(placeFooterCell);
  footerRow.appendChild(nameFooterCell);
  footerRow.appendChild(dataFooterCell);
  tfoot.appendChild(footerRow);
  table.appendChild(tfoot);
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
  if (skinId === 2 || skinId === 5  || skinId === 6 || skinId === 7) {
    await checkAutoClickUpgrade()
  }
  if (skinId !== 5 && skinId !== 6 && skinId !== 7) {
    showUpgradeNotification(improvementData);
  }
  closeMenu();
}
window.useImprovement = useImprovement;

function showUpgradeNotification(improvementData) {
  const div = document.getElementById('header-center')
  const notification = document.getElementById('upgrade-notification');
  const timerText = document.getElementById('upgrade-timer');
  const upgradeName = document.getElementById('upgrade-name');
  const progressBar = document.getElementById('upgrade-progress');
  const image = document.getElementById('upgrade-image');
  let remaining = Math.floor((new Date(improvementData.endsAt).getTime() - Date.now()) / 1000);
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
      const response = fetch("/api/upgrade/end");
      div.style.display = 'none';
      if (menuTitleText.textContent === 'Инвентарь') {
        const buttons = document.querySelectorAll('#inventory-grid .improvement.disabled');
        buttons.forEach(button => {
          button.disabled = false;
          button.classList.remove('disabled');
        });
      }
    }
  }, 1000);
}

async function reload() {
  window.addEventListener("load", function () {
    checkUpgradeStatus();
    checkAutoClickUpgrade();
  });
}
async function checkUpgradeStatus() {
  const response = await fetch('/api/upgrade/status');
  const data = await response.json();
  if (data.isActive) {
    showUpgradeNotification(data);
  }
}

async function checkAutoClickUpgrade() {
  try {
    const res = await fetch('/api/upgrade/status');
    const upgradeInfo = await res.json();

    if (upgradeInfo.isActive && upgradeInfo.id === 2) {
      const interval = 500;
      const duration = new Date(upgradeInfo.endsAt).getTime() - Date.now();
      const intervalId = setInterval(() => {
        handleClick();
      }, interval);
      setTimeout(() => {
        clearInterval(intervalId);
      }, duration);
    }
    else if (upgradeInfo.isActive && (upgradeInfo.id === 5 || upgradeInfo.id === 6 || upgradeInfo.id === 7)) {
      await handleClick(bonusValues[upgradeInfo.id]);
    }

  } catch (error) {
    //console.error(error);
  }
}

function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu');
  menu.classList.toggle('hidden');
  const arrowSpan = document.getElementById('profile-dropdown-arrow');
  arrowSpan.textContent = arrowSpan.textContent == '▼' ? '▲' : '▼';
}
window.toggleProfileMenu = toggleProfileMenu;

// Анимация кнопки
document.querySelectorAll('.click-button').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.remove('clicked');
    void btn.offsetWidth;
    btn.classList.add('clicked');
  });
});

reload()