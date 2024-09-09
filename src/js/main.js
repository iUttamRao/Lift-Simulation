let liftsState = [];

function generateUI() {
    const floorsInput = document.getElementById('floors').value;
    const liftsInput = document.getElementById('lifts').value;
    const building = document.getElementById('building');

    if (!floorsInput || isNaN(floorsInput) || parseInt(floorsInput) <= 0) {
        alert("Please enter a valid positive number for floors.");
        return;
    }
    if (!liftsInput || isNaN(liftsInput) || parseInt(liftsInput) <= 0) {
        alert("Please enter a valid positive number for lifts.");
        return;
    }

    const floors = parseInt(floorsInput);
    const lifts = parseInt(liftsInput);

    building.innerHTML = '';
    liftsState = [];

    const liftWidth = 120;
    const containerWidth = liftWidth * lifts;
    building.style.width = `${containerWidth}px`;

    for (let i = 0; i < floors; i++) {
        const floorDiv = document.createElement('div');
        floorDiv.className = 'floor';
        floorDiv.id = `floor-${i + 1}`;

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons';

        const upButton = document.createElement('div');
        upButton.className = 'button up';
        upButton.textContent = 'Up';
        upButton.onclick = () => callLift(i + 1);

        const downButton = document.createElement('div');
        downButton.className = 'button down';
        downButton.textContent = 'Down';
        downButton.onclick = () => callLift(i + 1);

        buttonsDiv.appendChild(upButton);
        if (i !== 0) {
            buttonsDiv.appendChild(downButton);
        }

        floorDiv.appendChild(buttonsDiv);

        const liftsContainer = document.createElement('div');
        liftsContainer.className = 'lifts-container';
        liftsContainer.style.width = `${containerWidth}px`;

        if (i === 0) { 
            for (let j = 0; j < lifts; j++) {
                const liftDiv = document.createElement('div');
                liftDiv.className = 'lift';
                liftDiv.id = `lift-${j + 1}`;

                const leftDoor = document.createElement('div');
                leftDoor.className = 'door left';

                const rightDoor = document.createElement('div');
                rightDoor.className = 'door right';

                liftDiv.appendChild(leftDoor);
                liftDiv.appendChild(rightDoor);

                liftsContainer.appendChild(liftDiv);
                liftsState.push({
                    currentFloor: 1,
                    moving: false,
                    targetFloors: []
                });
            }
        }

        floorDiv.appendChild(liftsContainer);
        building.appendChild(floorDiv);
    }
}

function callLift(floor) {
    console.log(`Lift called to floor ${floor}`);
    let selectedLift = null;
    let minDistance = Infinity;

    liftsState.forEach((lift, index) => {
        const distance = Math.abs(lift.currentFloor - floor);
        if (!lift.moving && distance < minDistance) {
            selectedLift = index;
            minDistance = distance;
        }
    });

    if (selectedLift !== null) {
        moveLift(selectedLift, floor);
    }
}

function moveLift(liftIndex, targetFloor) {
    const lift = document.getElementById(`lift-${liftIndex + 1}`);
    const liftState = liftsState[liftIndex];
    
    liftState.moving = true;
    const moveDistance = Math.abs(liftState.currentFloor - targetFloor);
    lift.style.transform = `translateY(-${100 * (targetFloor - 1)}px)`;

    setTimeout(() => {
        openDoors(lift);
        setTimeout(() => {
            closeDoors(lift);
            liftState.currentFloor = targetFloor;
            liftState.moving = false;
        }, 2500);
    }, moveDistance * 2000);
}

function openDoors(lift) {
    const leftDoor = lift.querySelector('.door.left');
    const rightDoor = lift.querySelector('.door.right');
    leftDoor.style.width = '0';
    rightDoor.style.width = '0';
}

function closeDoors(lift) {
    const leftDoor = lift.querySelector('.door.left');
    const rightDoor = lift.querySelector('.door.right');
    leftDoor.style.width = '50%';
    rightDoor.style.width = '50%';
}
