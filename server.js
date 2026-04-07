require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { swaggerUi, specs } = require('./swagger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Adjust for production
});

app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { swaggerOptions: { url: '/api-docs.json' } }));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

// Root Route
app.get('/', (req, res) => {
    res.json({ message: 'Live Chatting APIs - Server is running ✓', status: 'online', docsUrl: '/api-docs' });
});

// Mount Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

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
    const { sender, receiver, text } = data;

    const newMessage = new Message({ sender, receiver, text });
    await newMessage.save();

    // Emit to the receiver's specific room
    io.to(receiver).emit('receive_message', {
        sender,
        text,
        createdAt: newMessage.createdAt
    });
    
    // Optional: Emit back to sender to confirm delivery
    socket.emit('message_sent', newMessage);
});
 
    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

const PORT = parseInt(process.env.PORT, 10) || 5001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        server.listen(PORT, () => console.log(`Server & Socket running on port ${PORT}`));
    })
    .catch(err => console.log(err));

server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. To free it, run:\n  lsof -i :${PORT} -t | xargs kill -9`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});