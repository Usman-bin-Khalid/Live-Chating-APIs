require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Adjust for production
});

app.use(express.json());

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    // Join a private room based on User ID
    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private room`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
        const { sender, receiver, message } = data;

        // 1. Save to Database
        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

        // 2. Emit to Receiver's private room
        io.to(receiver).emit('receive_message', newMessage);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => server.listen(5000, () => console.log('Server & Socket running on port 5000')))
    .catch(err => console.log(err));