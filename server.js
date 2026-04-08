require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Message = require('./models/Message');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { swaggerUi, specs } = require('./swagger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false
    }
});

// CORS - Must be FIRST middleware
const corsOptions = {
    origin: '*',
    credentials: false,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', '*']
};

app.use(cors(corsOptions));

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
// Health check endpoint
app.get('/health', (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? '✓ Connected' : '✗ Disconnected';
    res.json({
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        mongodb: mongoStatus,
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        status: err.status || 500
    });
});

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

// Start server first (don't wait for MongoDB)
server.listen(PORT, () => {
    console.log(`✓ Server & Socket running on port ${PORT}`);
});

// Connect to MongoDB in the background
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✓ MongoDB connected successfully');
    })
    .catch(err => {
        console.error('✗ MongoDB connection error:', err.message);
        console.warn('⚠ Server will continue without database connection - please fix MONGO_URI');
    });

mongoose.connection.on('disconnected', () => {
    console.warn('⚠ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('✗ MongoDB error:', err.message);
});

server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`✗ Port ${PORT} is already in use. To free it, run:\n  lsof -i :${PORT} -t | xargs kill -9`);
        process.exit(1);
    } else {
        console.error('✗ Server error:', err);
    }
});