import { marketMenu } from './menu/market-menu.js';
import { loadInventory } from './menu/inventory-menu.js';
import { openTab, resetRank } from './menu/rating-menu.js';

const menuOverlay = document.getElementById("menu-overlay");
const menuTitleText = document.getElementById("menu-title-text");
const infoContainer = document.getElementById("info-container");
const infoTitle = document.getElementById("info-title");
const infoText = document.getElementById("info-text");

async function openMenu(id) {
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
    await loadInventory();
  } else if (id === 'Рейтинг') {
    document.getElementById('tabs').style.display = 'flex';
    await openTab();
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
