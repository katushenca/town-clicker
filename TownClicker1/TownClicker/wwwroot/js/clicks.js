const button = document.querySelector('.click-button');
const counterElement = document.getElementById('click-count');

async function loadBalance() {
        try {
            const response = await fetch('http://localhost:5045/api/Statistics/r');
            if (!response.ok) {
                throw new Error('Ошибка HTTP: ' + response.status);
            }
            let clicks = await response.text();
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }

async function increaseBalance(diff) {
    try {
        const curBalanceResponse = await fetch(`http://localhost:5045/api/Statistics`);
        if (!curBalanceResponse.ok) {
            throw new Error('Ошибка HTTP: ' + curBalanceResponse.status);
        }
        const data = {
            AmountChange: diff,
        };
        const incBalanceResponse = await fetch('http://localhost:5045/api/Statistics',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

        if (!incBalanceResponse.ok) {
            throw new Error('Ошибка HTTP: ' + curBalanceResponse.status);
        }
        const curMoney = Number(await curBalanceResponse.text());
        counterElement.textContent = (curMoney + diff).toString()
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function handleClick() {
    const response = await fetch(`/api/upgrade/status`);
    const items = await response.json();
    console.log(items);
    if (items.isActive === true && items.id === 1)
        await increaseBalance(2);
    else
        await increaseBalance(1);
}
let autoClickerActive = false;
let autoClickerTimer = null;
let autoClickerEnd = null;
async function checkAutoClicker() {
    try {
        const response = await fetch(`/api/upgrade/status`);
        const items = await response.json();
        if (items.isActive === true && items.id === 2 && !autoClickerActive) {
            autoClickerActive = true;
            autoClickerEnd = Date.now() + 60;
            autoClickerTimer = setInterval(() => {
                if (Date.now() < autoClickerEnd) {
                    increaseBalance(1);
                } else {
                    clearInterval(autoClickerTimer);
                    autoClickerActive = false;
                    autoClickerTimer = null;
                }
            }, 1000);
        }
    } catch (err) {
        console.error('checkAutoClicker error:', err);
    }
}
button.addEventListener("click", handleClick);
setInterval(checkAutoClicker, 1000);

