// Локальные переменные
let button = document.querySelector('.click-button');
let totalClicks = 0;
let coinBalance = 0;
let unsavedClicks = 0;
let unsavedCoins = 0;
let coinsPerClick = 1;
let lastUpdateTime = 0;
// Конфигурация
const UPDATE_INTERVAL = 5000; // 20 секунд
const MIN_CLICKS_FOR_UPDATE = 0;
const MIN_COINS_FOR_UPDATE = 0;

// Обработчик клика
async function handleClick(bonus = 1) {
    const extra = await checkIncrementUpgrades();
    totalClicks++;
    unsavedClicks++;
    coinBalance += coinsPerClick * extra + (bonus - 1);
    unsavedCoins += coinsPerClick * extra + (bonus - 1);
    updateMoney(currentTotalMoney + unsavedCoins);
    // Проверяем, нужно ли отправить обновление
    if (unsavedClicks >= MIN_CLICKS_FOR_UPDATE || unsavedCoins >= MIN_COINS_FOR_UPDATE) {
        try {
            sendUpdateToServer();
        } catch (error){
            
        }
        finally {
            unsavedClicks = 0;
            unsavedCoins = 0;
            lastUpdateTime = Date.now();
        }
    }
}

// Функция отправки данных на сервер
async function sendUpdateToServer() {
    if (unsavedClicks === 0 && unsavedCoins === 0) return;

    try {
        const response = await fetch('api/Statistics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'ClicksDiff': unsavedClicks,
                'MoneyDiff': unsavedCoins
            })
        });
    } catch (error) {
        //console.error('Ошибка при обновлении статистики:', error);
    }
}

// Периодическая проверка
setInterval(() => {
    if (unsavedClicks > 0 || unsavedCoins > 0) {
        sendUpdateToServer();
    }
}, UPDATE_INTERVAL);

// Сохранение при закрытии вкладки
window.addEventListener('beforeunload', (event) => {
    if (unsavedClicks > 0 || unsavedCoins > 0) {
        // Используем synchronous XMLHttpRequest, так как async не гарантирует выполнение
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/update-stats', false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            clicks: unsavedClicks,
            coins: unsavedCoins
        }));
    }
});

// Загрузка начальных данных при старте
async function loadInitialData() {
    try {
        const response = await fetch('api/Statistics');
        const data = await response.json();
        totalClicks = data.clicks;
        coinBalance = data.money;
    } catch (error) {
        //console.error('Ошибка при загрузке статистики:', error);
    }
}

async function checkIncrementUpgrades() {
    try {
        const res = await fetch('api/upgrade/status');
        const upgradeInfo = await res.json();
        if (!upgradeInfo.isActive)
            return 1;
        if (upgradeInfo.id === 1) {
            return 2;
        }
        else if (upgradeInfo.id === 3) {
            return 4;
        }
        else if (upgradeInfo.id === 4) {
            return 8;
        }
    } catch (error) {
        //console.error(error);
    }
    return 1;
}

// async function handleClick() {
//     await increaseBalance(1);
// }
button.addEventListener("click", () => handleClick());
// Инициализация
// loadInitialData();


