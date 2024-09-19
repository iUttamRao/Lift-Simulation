let liftsState = [];
let calls = {};
let callQueue = [];

function generateUI() {
    const floorsInput = document.getElementById('floors').value;
    const liftsInput = document.getElementById('lifts').value;
    const building = document.getElementById('building');

    if (!floorsInput || isNaN(floorsInput) || parseInt(floorsInput) <= 1) {
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
    calls = {}; 
    callQueue = [];

    const liftWidth = 120;
    const minWidth = 180; 
    const containerWidth = Math.max(liftWidth * lifts, minWidth);
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
        upButton.onclick = () => callLift(i + 1, 'up');

        const downButton = document.createElement('div');
        downButton.className = 'button down';
        downButton.textContent = 'Down';
        downButton.onclick = () => callLift(i + 1, 'down');

        if (i !== floors - 1) {
            buttonsDiv.appendChild(upButton);
        }
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

function callLift(floor, direction) {
    if (calls[floor] && calls[floor][direction]) {
        console.log(`Lift already called for floor ${floor} and direction ${direction}`);
        return;
    }

    if (!calls[floor]) {
        calls[floor] = {};
    }
    calls[floor][direction] = true;

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
        moveLift(selectedLift, floor, direction);
    } else {
        console.log(`All lifts are busy. Adding call for floor ${floor} and direction ${direction} to the queue.`);
        callQueue.push({ floor, direction });
    }
}

function processQueuedCalls() {
    if (callQueue.length === 0) return;

    for (let i = 0; i < callQueue.length; i++) {
        const { floor, direction } = callQueue[i];
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
            console.log(`Processing queued call for floor ${floor} in direction ${direction}.`);
            moveLift(selectedLift, floor, direction);
            callQueue.splice(i, 1); 
            i--; 
        }
    }
}

setInterval(processQueuedCalls, 3000);

function moveLift(liftIndex, targetFloor, direction) {
    const lift = document.getElementById(`lift-${liftIndex + 1}`);
    const liftState = liftsState[liftIndex];

    liftState.moving = true;
    const moveDistance = Math.abs(liftState.currentFloor - targetFloor);
    lift.style.transition = `transform ${moveDistance*2}s linear`;
    lift.style.transform = `translateY(-${100.67 * (targetFloor - 1)}px)`;

    moveLiftAndHandleDoors(lift, moveDistance * 2000)
        .then(() => {
            liftState.currentFloor = targetFloor;
            liftState.moving = false;

            if (calls[targetFloor]) {
                delete calls[targetFloor][direction];
            }
        })
        .catch(error => {
            console.error("Error during lift operation:", error);
            liftState.moving = false;
        });
}

function moveLiftAndHandleDoors(lift, moveDuration) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            openDoors(lift);
            setTimeout(() => {
                closeDoors(lift);
                setTimeout(() => {
                    resolve();
                }, 2500); 
            }, 2500); 
        }, moveDuration);
    });
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
