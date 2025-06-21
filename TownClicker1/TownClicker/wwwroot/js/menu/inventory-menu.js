import { overlayState } from '../overlay.js';
import { handleClick } from '../click-money-logic.js';

const bonusValues = {
  5: 100,
  6: 200,
  7: 500,
};
const noTimeImprovements = [5, 6, 7];

const menuTitleText = document.getElementById("menu-title-text");

export async function loadInventory() {
  const response = await fetch(`/api/inventory/${overlayState.username}`);
  const upgradeResponse = await fetch('/api/upgrade/status');
  const activeUpgrade = await upgradeResponse.json();

  const items = await response.json();
  const grid = document.getElementById('inventory-grid');
  const buttonClass = activeUpgrade.isActive && !noTimeImprovements.includes(Number(activeUpgrade.id)) ? 'improvement disabled' : 'improvement';
  const disabledAttr = activeUpgrade.isActive && !noTimeImprovements.includes(Number(activeUpgrade.id)) ? 'disabled' : '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'inventory-item';
    div.innerHTML = `
        <button class="${buttonClass}"  ${disabledAttr} onclick="useImprovement(this, ${item.skinId})">
         <img src="${item.url}" alt="${item.skinName}">
            <div class="item-name">${item.skinName}</div>
        </button>
    `;
    grid.appendChild(div);
  });
  await animateItems();
}

async function animateItems() {
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

async function useImprovement(buttonElement, skinId) {
  buttonElement.closest('.inventory-item')?.remove();
  const response = await fetch(`/api/inventory/${overlayState.username}/${skinId}`);
  const improvementData = await response.json();
  if (skinId === 2 || skinId === 5 || skinId === 6 || skinId === 7) {
    await checkAutoClickUpgrade();
  }
  if (skinId !== 5 && skinId !== 6 && skinId !== 7) {
    showUpgradeNotification(improvementData);
  }
  closeMenu();
}
window.useImprovement = useImprovement;

function showUpgradeNotification(improvementData) {
  const div = document.getElementById('header-center');
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

reload();