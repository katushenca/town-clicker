import { improvements, improvementTime, weightedImprovements} from "./constants.js";


function getRandomImprovementId() {
    const rnd = Math.random() * 100;
    let totalSum = 0;
    for (const item of weightedImprovements) {
        totalSum += item.weight;
        if (rnd < totalSum) {
            return item.id;
        }
    }
    return weightedImprovements[0].id;
}

function getRandomBuilding() {
    const buildings = document.querySelectorAll("#building");
    if (buildings.length === 0) return null;
    const index = Math.floor(Math.random() * buildings.length);
    return buildings[index];
}

function createImproveButton(improvementId, onRemove) {
    const button = document.createElement("button");
    button.classList.add("improve");
    button.style.backgroundImage = `url(${improvements[improvementId]})`;

    button.addEventListener("click", () => {
        fetch('/api/upgrade/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(improvementId)
        })
            .then((resp) => {
                if (resp.ok) {
                    onRemove(button);
                }
            });
    });

    return button;
}

function drawImprovement() {
    const building = getRandomBuilding();
    if (!building) {
        return;
    }
    const container = building.closest('.sprite-container');
    if (!container || container.querySelector("button.improve")) {
        return;
    }

    const improvementId = getRandomImprovementId();
    const button = createImproveButton(improvementId, (b) => b.remove());
    container.appendChild(button);
}

setInterval(drawImprovement, improvementTime);