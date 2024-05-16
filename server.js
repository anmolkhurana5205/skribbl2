const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', (callback) => {
        const roomId = uuidv4();
        socket.join(roomId);
        callback(roomId);
    });

    socket.on('joinRoom', (roomId, callback) => {
        const rooms = io.sockets.adapter.rooms;
        if (rooms.get(roomId)) {
            socket.join(roomId);
            callback(true);
        } else {
            callback(false);
        }
    });

    socket.on('drawing', (data) => {
        io.to(data.roomId).emit('drawing', data);
    });

    socket.on('chatMessage', (data) => {
        io.to(data.roomId).emit('chatMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});