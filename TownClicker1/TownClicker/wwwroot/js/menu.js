const menuOverlay = document.getElementById("menu-overlay");
const menuTitleText = document.getElementById("menu-title-text");

function openMenu(id) {
  menuTitleText.textContent = id;
  menuOverlay.style.display = 'flex';
}

function closeMenu() {
  menuOverlay.style.display = 'none';
}
