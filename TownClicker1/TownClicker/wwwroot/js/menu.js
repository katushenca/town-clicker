const menuOverlay = document.getElementById("menu-overlay");
const menuTitleText = document.getElementById("menu-title-text");

async function openMenu(id, userName=null) {
  menuTitleText.textContent = id;
  menuOverlay.style.display = 'flex';
  const grid = document.getElementById('inventory-grid');
  const rankTable = document.getElementById('rating-table');
  
  if (id === 'Инвентарь') {
    grid.style.display = 'flex';
    await loadInventory(userName);
  } else if (id === 'Рейтинг') {
    rankTable.style.display = 'flex';
    await loadRank(userName);
  } else {
    grid.style.display = 'none';
    grid.innerHTML = '';
    rankTable.style.display = 'none';
    rankTable.innerHTML = '';
  }
}

function closeMenu() {
  menuOverlay.style.display = 'none';
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
    nameCell.textContent = item.id;
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