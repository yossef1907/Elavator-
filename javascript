// Elevator state object
const elevator = {
    currentFloor: 1,
    targetFloors: [],
    state: 'idle',
    doorState: 'closed',
    direction: null,
    timer: null,
    movingInterval: null
};

// DOM elements
const elements = {
    shaft: document.getElementById('elevatorShaft'),
    car: document.getElementById('elevatorCar'),
    floorButtons: document.getElementById('floorButtons'),
    callUpBtn: document.getElementById('callUpBtn'),
    callDownBtn: document.getElementById('callDownBtn'),
    openDoorBtn: document.getElementById('openDoorBtn'),
    closeDoorBtn: document.getElementById('closeDoorBtn'),
    emergencyBtn: document.getElementById('emergencyBtn'),
    elevatorState: document.getElementById('elevatorState'),
    doorState: document.getElementById('doorState'),
    floorCounter: document.getElementById('floorCounter'),
    requestedFloorsDisplay: document.getElementById('requestedFloorsDisplay')
};

// Initialize floors (10 floors)
function initializeFloors() {
    for (let i = 10; i >= 1; i--) {
        const floor = document.createElement('div');
        floor.className = 'floor';
        floor.id = `floor-${i}`;
        floor.textContent = i;
        elements.shaft.appendChild(floor);

        const floorBtn = document.createElement('button');
        floorBtn.className = 'btn';
        floorBtn.textContent = i;
        floorBtn.dataset.floor = i;
        floorBtn.addEventListener('click', () => callElevatorToFloor(i));
        elements.floorButtons.appendChild(floorBtn);
    }
}

// Update elevator visual position
function updateElevatorPosition() {
    const floorHeight = document.querySelector('.floor').offsetHeight + 6;
    const bottomPosition = (elevator.currentFloor - 1) * floorHeight;
    elements.car.style.bottom = `${bottomPosition}px`;
    updateFloorCounter();
    highlightCurrentFloor();
    updateElevatorDirection();
}

// Update floor counter display
function updateFloorCounter() {
    elements.floorCounter.textContent = `Floor: ${elevator.currentFloor}`;
}

// Highlight current floor
function highlightCurrentFloor() {
    document.querySelectorAll('.floor').forEach(floor => {
        floor.classList.remove('current');
    });
    document.getElementById(`floor-${elevator.currentFloor}`).classList.add('current');
}

// Update elevator direction indicator
function updateElevatorDirection() {
    elements.car.textContent = elevator.direction === 'up' ? '▲' : elevator.direction === 'down' ? '▼' : '';
}

// Update UI based on state
function updateUI() {
    elements.elevatorState.textContent = elevator.state;
    elements.doorState.textContent = elevator.doorState;
    updateButtonsState();
    updateRequestedFloorsDisplay();
}

// Update requested floors display
function updateRequestedFloorsDisplay() {
    elements.requestedFloorsDisplay.textContent = `Requested Floors: [${elevator.targetFloors.join(', ')}]`;
}

// Update buttons enabled/disabled state
function updateButtonsState() {
    const isMoving = ['moving-up', 'moving-down'].includes(elevator.state);
    
    elements.callUpBtn.disabled = elevator.currentFloor === 10 || isMoving;
    elements.callDownBtn.disabled = elevator.currentFloor === 1 || isMoving;

    document.querySelectorAll('.btn[data-floor]').forEach(btn => {
        const floorNum = parseInt(btn.dataset.floor);
        btn.disabled = elevator.targetFloors.includes(floorNum) || floorNum === elevator.currentFloor;
    });

    elements.openDoorBtn.disabled = elevator.doorState === 'open' || isMoving;
    elements.closeDoorBtn.disabled = elevator.doorState === 'closed' || isMoving;
}

// Call elevator to specific floor
function callElevatorToFloor(floor) {
    if (floor === elevator.currentFloor || elevator.targetFloors.includes(floor)) return;

    elevator.targetFloors.push(floor);
    sortTargetFloors();
    updateUI();

    if (elevator.state === 'idle' || elevator.state === 'doors-open') {
        moveElevator();
    }
}

// Sort target floors based on direction and current position
function sortTargetFloors() {
    if (elevator.direction === 'up' || elevator.state === 'idle') {
        elevator.targetFloors.sort((a, b) => a - b);
    } else if (elevator.direction === 'down') {
        elevator.targetFloors.sort((a, b) => b - a);
    }
}

// Move elevator to next target floor
function moveElevator() {
    if (elevator.targetFloors.length === 0) {
        elevator.state = 'idle';
        elevator.direction = null;
        updateUI();
        return;
    }

    const nextFloor = elevator.targetFloors[0];
    elevator.direction = nextFloor > elevator.currentFloor ? 'up' : 'down';
    elevator.state = `moving-${elevator.direction}`;
    updateUI();

    startFloorCounter(nextFloor);

    setTimeout(() => {
        elevator.currentFloor = nextFloor;
        elevator.targetFloors = elevator.targetFloors.filter(f => f !== nextFloor);
        updateElevatorPosition();
        openDoors();
    }, Math.abs(nextFloor - elevator.currentFloor) * 800);
}

// Show floor numbers during movement
function startFloorCounter(targetFloor) {
    let current = elevator.currentFloor;
    const step = targetFloor > current ? 1 : -1;

    clearInterval(elevator.movingInterval);

    elevator.movingInterval = setInterval(() => {
        current += step;
        elements.floorCounter.textContent = `Floor: ${current}`;
        if (current === targetFloor) {
            clearInterval(elevator.movingInterval);
        }
    }, 500);
}

// Open elevator doors
function openDoors() {
    elevator.state = 'doors-open';
    elevator.doorState = 'open';
    updateUI();

    clearTimeout(elevator.timer);
    elevator.timer = setTimeout(closeDoors, 4000);
}

// Close elevator doors
function closeDoors() {
    elevator.doorState = 'closed';
    updateUI();

    if (elevator.targetFloors.length > 0) {
        setTimeout(() => {
            moveElevator();
        }, 1000);
    } else {
        elevator.state = 'idle';
        elevator.direction = null;
        updateUI();
    }
}

// Emergency stop function
function emergencyStop() {
    clearTimeout(elevator.timer);
    clearInterval(elevator.movingInterval);
    elevator.state = 'idle';
    elevator.doorState = 'closed';
    elevator.targetFloors = [];
    updateUI();
    updateElevatorPosition();
}

// Initialize the elevator system
function initialize() {
    initializeFloors();
    updateElevatorPosition();
    updateUI();

    elements.callUpBtn.addEventListener('click', () => callElevatorToFloor(elevator.currentFloor + 1));
    elements.callDownBtn.addEventListener('click', () => callElevatorToFloor(elevator.currentFloor - 1));
    elements.openDoorBtn.addEventListener('click', openDoors);
    elements.closeDoorBtn.addEventListener('click', closeDoors);
    elements.emergencyBtn.addEventListener('click', emergencyStop);
}

// Start the application when DOM is loaded
window.addEventListener('DOMContentLoaded', initialize);
