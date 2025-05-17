const menuOverlay = document.getElementById("menu-overlay");
const menuTitleText = document.getElementById("menu-title-text");
const menuContent = document.getElementById("menu-content");

async function openMenu(id, userName=null) {
  menuTitleText.textContent = id;
  if (id === 'shop')
    await marketMenu();
  menuOverlay.style.display = 'flex';
  const grid = document.getElementById('inventory-grid');
  
  if (id === 'Инвентарь') {
    grid.style.display = 'flex';
    await loadInventory(userName);
  } else {
    grid.style.display = 'none';
    grid.innerHTML = '';
  }
}

function closeMenu() {
  menuOverlay.style.display = 'none';
  menuContent.innerHTML = '';
}

async function marketMenu() {
  const buildings = [...buildingsData.buildings].sort((a, b) => a.initialCost - b.initialCost);
  const levels = await (await fetch("market")).json();
  const buildingsList = document.createElement("div");
  for (const building of buildings) {
    const buildingDiv = document.createElement("div");
    buildingDiv.innerHTML = `
      <h3>${building.id}</h3>
      <p id="building-level-${building.id}">Level: ${levels.find(l => l.upgradeId === building.id)?.level || 0}</p>
      <button onclick="buyBuilding('${building.id}')">Buy</button>
    `;
    buildingsList.appendChild(buildingDiv);
  };
  menuContent.appendChild(buildingsList);
}

async function buyBuilding(id) {
  await fetch(`market?upgradeId=${id}`, {
    method: "POST"
  });
  const buildingLevel = document.getElementById(`building-level-${id}`);
  const currentLevel = parseInt(buildingLevel.textContent.split(": ")[1]);
  buildingLevel.textContent = `Level: ${currentLevel + 1}`;
  builder.addBuilding(id);
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