import { overlayState } from '../overlay.js';

export function resetRank() {
  document.getElementById(`popularity-tab`).classList.remove('active');
  document.getElementById(`clicks-tab`).classList.remove('active');
  document.getElementById('popularity').innerHTML = '';
  document.getElementById('clicks').innerHTML = '';
  document.getElementById('popularity').style.display = 'none';
  document.getElementById('clicks').style.display = 'none';
  document.getElementById('tabs').style.display = 'none';
}

export async function openTab(tableId = 'popularity') {
  if (document.getElementById(`${tableId}-tab`).classList.contains('active')) {
    return;
  }
  const other = tableId === 'popularity' ? 'clicks' : 'popularity';
  document.getElementById(other).innerHTML = '';
  document.getElementById(other).style.display = 'none';
  document.getElementById(tableId).style.display = 'block';
  document.getElementById(`${other}-tab`).classList.remove('active');
  document.getElementById(`${tableId}-tab`).classList.add('active');
  await loadRank(tableId);
}
window.openTab = openTab;

async function loadRank(type = 'popularity') {
  const response = await fetch(`/api/rank/statistics/${type}`);
  const items = await response.json();

  const person = await fetch(`/api/rank/statistics/${overlayState.username}`);
  const person_items = await person.json();
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
  nameFooterCell.textContent = overlayState.username;
  const dataFooterCell = document.createElement('td');
  dataFooterCell.textContent = type === 'popularity' ? person_items.popularity : person_items.clicks;
  footerRow.appendChild(placeFooterCell);
  footerRow.appendChild(nameFooterCell);
  footerRow.appendChild(dataFooterCell);
  tfoot.appendChild(footerRow);
  table.appendChild(tfoot);
}
