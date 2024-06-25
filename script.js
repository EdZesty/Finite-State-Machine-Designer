const canvas = document.getElementById('fsmCanvas');
const ctx = canvas.getContext('2d');

const states = [];
let transitions = [];
let isDrawing = false;
let startState = null;
let selectedState = null;
let deleteMode = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete') {
        deleteMode = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Delete') {
        deleteMode = false;
    }
});

canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const label = prompt("Enter state label:", `q${states.length}`);
    states.push({ x, y, label, isAccepting: false });
    draw();
});

canvas.addEventListener('mousedown', (e) => {
    if (e.shiftKey) {
        startState = getStateAtPosition(e);
        if (startState) {
            isDrawing = true;
        }
    } else {
        selectedState = getStateAtPosition(e);
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isDrawing) {
        isDrawing = false;
        const endState = getStateAtPosition(e);
        if (startState && endState && startState !== endState) {
            const inputSymbol = prompt("Enter input symbol for this transition:");
            transitions.push({ from: startState, to: endState, symbol: inputSymbol });
            draw();
        }
        startState = null;
    }
    selectedState = null;
});

canvas.addEventListener('mousemove', (e) => {
    if (selectedState && !e.shiftKey) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        selectedState.x = x;
        selectedState.y = y;
        draw();
    }
});

canvas.addEventListener('click', (e) => {
    if (deleteMode) {
        const state = getStateAtPosition(e);
        if (state) {
            const index = states.indexOf(state);
            if (index > -1) {
                states.splice(index, 1);
                transitions = transitions.filter(t => t.from !== state && t.to !== state);
                draw();
            }
        } else {
            const transition = getTransitionAtPosition(e);
            if (transition) {
                const index = transitions.indexOf(transition);
                if (index > -1) {
                    transitions.splice(index, 1);
                    draw();
                }
            }
        }
    }
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    states.forEach(state => {
        ctx.beginPath();
        ctx.arc(state.x, state.y, 20, 0, 2 * Math.PI);
        ctx.stroke();  // Solo dibuja el borde del estado
        ctx.fillText(state.label, state.x - 10, state.y + 5);
        if (state.isAccepting) {
            ctx.beginPath();
            ctx.arc(state.x, state.y, 25, 0, 2 * Math.PI);
            ctx.stroke();
        }
    });
    transitions.forEach(transition => {
        ctx.beginPath();
        ctx.moveTo(transition.from.x, transition.from.y);
        ctx.lineTo(transition.to.x, transition.to.y);
        ctx.stroke();
        const midX = (transition.from.x + transition.to.x) / 2;
        const midY = (transition.from.y + transition.to.y) / 2;
        ctx.fillText(transition.symbol, midX, midY);
    });
}

function getStateAtPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return states.find(state => Math.hypot(state.x - x, state.y - y) < 20);
}

function getTransitionAtPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return transitions.find(transition => {
        const midX = (transition.from.x + transition.to.x) / 2;
        const midY = (transition.from.y + transition.to.y) / 2;
        return Math.hypot(midX - x, midY - y) < 10;
    });
}

function validateString() {
    const inputString = document.getElementById('inputString').value;
    if (inputString === '') {
        alert("Please enter a string to validate.");
        return;
    }

    let currentState = states[0];
    for (let symbol of inputString) {
        const transition = transitions.find(t => t.from === currentState && t.symbol === symbol);
        if (!transition) {
            alert("String is invalid.");
            return;
        }
        currentState = transition.to;
    }

    if (currentState.isAccepting) {
        alert("String is valid.");
    } else {
        alert("String is invalid.");
    }
}

function resetDiagram() {
    states.length = 0;
    transitions.length = 0;
    draw();
}

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const state = getStateAtPosition(e);
    if (state) {
        states.forEach(s => s.isAccepting = false);  // Desactiva todos los estados de aceptación
        state.isAccepting = !state.isAccepting;  // Activa el estado actual
        draw();
    }
});
