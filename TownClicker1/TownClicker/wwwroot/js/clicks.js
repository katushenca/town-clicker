const button = document.querySelector('.click-button');
const counterElement = document.getElementById('click-count');



// Создаем переменную-счетчик
let count = 0;

// Функция-обработчик клика
function handleClick() {
    // Увеличиваем счетчик
    count += 1;

    // Обновляем отображаемое значение
    counterElement.textContent = count;

    // Можно добавить дополнительную логику:
    // if (count > 10) { ... }
}

// Добавляем обработчик события на кнопку
button.addEventListener('click', handleClick);