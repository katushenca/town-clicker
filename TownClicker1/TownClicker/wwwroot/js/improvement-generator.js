const improvements = {
    1: '/images/improvements/x2.png',
    2: '/images/improvements/auto-clicker.png',
};

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

setInterval(drawImprovement, 60_000);