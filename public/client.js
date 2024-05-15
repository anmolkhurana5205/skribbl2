const socket = io();

// Room creation and joining functionality
document.getElementById('createRoomButton').addEventListener('click', () => {
    socket.emit('createRoom', (roomId) => {
        const roomLink = `${window.location.href}?roomId=${roomId}`;
        prompt('Share this link with your friends to join the room:', roomLink);
    });
});

document.getElementById('joinRoomButton').addEventListener('click', () => {
    const roomId = prompt('Enter the Room ID:');
    socket.emit('joinRoom', roomId, (isJoined) => {
        if (isJoined) {
            console.log('Joined room:', roomId);
        } else {
            alert('Room not found!');
        }
    });
});

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    if (roomId) {
        socket.emit('joinRoom', roomId, (isJoined) => {
            if (isJoined) {
                console.log('Joined room:', roomId);
            } else {
                alert('Room not found!');
            }
        });
    }
};

// Drawing functionality
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let [lastX, lastY] = [0, 0];
const colorPicker = document.getElementById('color-picker'); // Get the color picker element
const lineWidthSlider = document.getElementById('line-width-slider');
let lineWidth = parseInt(lineWidthSlider.value); // Initial line width

// Add event listener to update stroke style when color is picked
colorPicker.addEventListener('input', function() {
    ctx.strokeStyle = colorPicker.value;
});

// Update the line width when the slider value changes
lineWidthSlider.addEventListener('input', () => {
    lineWidth = parseInt(lineWidthSlider.value);
});

// Add a new event listener for drawing
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const x = e.offsetX;
        const y = e.offsetY;
        drawLine(lastX, lastY, x, y);
        [lastX, lastY] = [x, y];
        socket.emit('drawing', { roomId: getRoomId(), x1: lastX, y1: lastY, x2: x, y2: y });
    }
});

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();
}

// Style boldness slider and color picker
lineWidthSlider.style.position = 'absolute';
lineWidthSlider.style.top = '10px';
lineWidthSlider.style.left = '10px';

colorPicker.style.position = 'absolute';
colorPicker.style.top = '40px';
colorPicker.style.left = '10px';

socket.on('drawing', (data) => {
    drawLine(data.x1, data.y1, data.x2, data.y2);
});

// Chat functionality
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent the default behavior of the Enter key
        sendButton.click(); // Simulate a click on the send button
    }
});

sendButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message !== '') {
        socket.emit('chatMessage', { roomId: getRoomId(), message });
        displayChatMessage(message);
        chatInput.value = '';
    }
});

function displayChatMessage(message) {
    const li = document.createElement('li');
    li.textContent = message;
    li.style.borderBottom = '1px solid #ccc'; // Add a bottom border
    chatMessages.appendChild(li);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

socket.on('chatMessage', (data) => {
    const li = document.createElement('li');
    li.textContent = data.message;
    chatMessages.appendChild(li);
});

// Player list functionality
const playerList = document.getElementById('player-list');

socket.on('updatePlayerList', (players) => {
    playerList.innerHTML = '';
    players.forEach((player) => {
        const li = document.createElement('li');
        li.textContent = player.name;
        playerList.appendChild(li);
    });
});

// Start a new round
const startRoundButton = document.getElementById('start-round-button');
startRoundButton.addEventListener('click', () => {
    socket.emit('startRound');
});

// Helper function to get current room ID
function getRoomId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('roomId');
}
