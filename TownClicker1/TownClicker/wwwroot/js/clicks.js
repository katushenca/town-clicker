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
    await increaseBalance(1);
}

button.addEventListener("click", handleClick);