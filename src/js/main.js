let liftsState = [];
let calls = {}; // Tracks active calls for each floor and direction

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
    calls = {}; // Reset the call tracking

    const liftWidth = 120;
    const minWidth = 180; // Set a minimum width for the building
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
    // If there's already a call in the same direction, do nothing
    if (calls[floor] && calls[floor][direction]) {
        console.log(`Lift already called for floor ${floor} and direction ${direction}`);
        return;
    }

    if (!calls[floor]) {
        calls[floor] = {};
    }
    calls[floor][direction] = true; // Mark the call as active for this floor and direction

    console.log(`Lift called to floor ${floor} in direction ${direction}`);
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
    }
}

function moveLift(liftIndex, targetFloor, direction) {
    const lift = document.getElementById(`lift-${liftIndex + 1}`);
    const liftState = liftsState[liftIndex];

    liftState.moving = true;
    const moveDistance = Math.abs(liftState.currentFloor - targetFloor);
    lift.style.transition = `transform ${moveDistance * 2}s`;
    lift.style.transform = `translateY(-${100 * (targetFloor - 1)}px)`;

    // Move the lift and handle doors in sequence
    moveLiftAndHandleDoors(lift, moveDistance * 2000)
        .then(() => {
            liftState.currentFloor = targetFloor;
            liftState.moving = false;

            // Remove the call for this floor and direction once completed
            if (calls[targetFloor]) {
                delete calls[targetFloor][direction];
            }
        })
        .catch(error => {
            console.error("Error during lift operation:", error);
            liftState.moving = false; // Ensure the lift state is updated even if an error occurs
        });
}

function moveLiftAndHandleDoors(lift, moveDuration) {
    return new Promise((resolve, reject) => {
        // Start lift movement
        setTimeout(() => {
            openDoors(lift);

            // Wait for doors to open
            setTimeout(() => {
                closeDoors(lift);

                // Wait for doors to close before resolving
                setTimeout(() => {
                    resolve();
                }, 2500); // Duration doors stay closed
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
