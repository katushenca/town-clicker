window.bonusValues = {
    5: 100,
    6: 200,
    7: 500,
}

improvements = {
    1: '/images/improvements/x2.png',
    2: '/images/improvements/auto-clicker.png',
    3: '/images/improvements/x4.png',
    4: '/images/improvements/x8.png',
    5: '/images/improvements/bonus_100.png',
    6: '/images/improvements/bonus_200.png',
    7: '/images/improvements/bonus_500.png',
};

window.noTimeImprovements = [5, 6, 7];

function drawImprovement() {
    const buildings = document.querySelectorAll("#building");
    const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
    const currentParent = randomBuilding.closest('.sprite-container');
    if (currentParent.querySelector("button.improve") !== null) {
        return;
    }
    const min = 1;
    const max = Object.keys(improvements).length;
    const improvementId = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const improve = document.createElement("button")
    improve.classList.add("improve");
    improve.style.backgroundImage = `url(${improvements[improvementId]})`;
    currentParent.appendChild(improve);
    
    improve.addEventListener("click", (e) => {
        fetch('/api/upgrade/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(improvementId)
        })
            .then(function (resp) {
                if (resp.ok)
                    improve.remove();
            })
    })
}

setInterval(drawImprovement, 5_000);