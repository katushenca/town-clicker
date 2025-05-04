const menuOverlay = document.getElementById("menu-overlay");
const menuTitleText = document.getElementById("menu-title-text");

async function openMenu(id, userName) {
  menuTitleText.textContent = id;
  menuOverlay.style.display = 'flex';
  if (id === 'inventory') {
    await loadInventory(userName);
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
    const div = document.createElement('div');
    div.className = 'inventory-item';
    div.innerHTML = `
         <img src="${item.url}" alt="${item.skinName}">
            <div class="item-name">${item.skinName}</div>
    `;
    grid.appendChild(div);
  });
}