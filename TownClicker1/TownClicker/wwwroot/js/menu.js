const menuOverlay = document.getElementById("menu-overlay");
const menuTitleText = document.getElementById("menu-title-text");
const menuContent = document.getElementById("menu-content");

async function openMenu(id) {
  menuTitleText.textContent = id;
  if (id === 'shop')
    await marketMenu();
  menuOverlay.style.display = 'flex';
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
