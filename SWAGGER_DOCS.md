# Live Chatting APIs - Swagger Documentation

## Overview
This project provides a real-time chatting API with Socket.io integration, user authentication, and message management.

## Live API Documentation

Access the interactive Swagger UI at:
- **Production:** `https://live-chatting-apis.onrender.com/api-docs`
- **Development:** `http://localhost:8080/api-docs`

## API Endpoints Summary

### Authentication Routes (`/auth`)

#### 1. **Signup** - Register a new user
- **Endpoint:** `POST /auth/signup`
- **Description:** Create a new user account
- **Request Body:**
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:** 201 Created
  ```json
  {
    "message": "User created successfully",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
  ```

#### 2. **Login** - User authentication
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticate with credentials and get JWT token
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:** 200 OK
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_doe"
    }
  }
  ```

#### 3. **Update Profile** - Modify user information
- **Endpoint:** `PUT /auth/profile`
- **Description:** Update user profile (requires JWT token)
- **Authentication:** Bearer Token (JWT)
- **Request Body:**
  ```json
  {
    "username": "john_doe_updated",
    "email": "john.updated@example.com"
  }
  ```
- **Response:** 200 OK (Updated user object)

---

### Chat Routes (`/chat`)

#### 1. **Get Inbox** - Retrieve all conversations
- **Endpoint:** `GET /chat/inbox`
- **Description:** Get all conversations with latest message and contact details
- **Authentication:** Bearer Token (JWT) - **Required**
- **Response:** 200 OK
  ```json
  [
    {
      "_id": "507f1f77bcf86cd799439012",
      "lastMessage": "Hey, how are you?",
      "timestamp": "2026-04-07T14:30:00Z",
      "contactDetails": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "jane_doe",
        "email": "jane@example.com"
      }
    }
  ]
  ```

#### 2. **Get Messages** - Retrieve conversation history
- **Endpoint:** `GET /chat/messages/:otherUserId`
- **Description:** Get all messages between current user and another user
- **Authentication:** Bearer Token (JWT) - **Required**
- **Parameters:**
  - `otherUserId` (path) - The ID of the other user in the conversation
- **Response:** 200 OK
  ```json
  [
    {
      "_id": "507f1f77bcf86cd799439013",
      "sender": "507f1f77bcf86cd799439011",
      "receiver": "507f1f77bcf86cd799439012",
      "text": "Hello!",
      "createdAt": "2026-04-07T14:25:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "sender": "507f1f77bcf86cd799439012",
      "receiver": "507f1f77bcf86cd799439011",
      "text": "Hi there!",
      "createdAt": "2026-04-07T14:30:00Z"
    }
  ]
  ```

---

## Socket.io Events

### Real-time Messaging

#### **join_room** (Client → Server)
Join a private room based on user ID
```javascript
socket.emit('join_room', userId);
```

#### **send_message** (Client → Server)
Send a message to another user
```javascript
socket.emit('send_message', {
  sender: "507f1f77bcf86cd799439011",
  receiver: "507f1f77bcf86cd799439012",
  text: "Hello!"
});
```

#### **receive_message** (Server → Client)
Receive a message from another user
```javascript
socket.on('receive_message', (data) => {
  // {
  //   sender: "507f1f77bcf86cd799439012",
  //   text: "Hi!",
  //   createdAt: "2026-04-07T14:30:00Z"
  // }
});
```

#### **message_sent** (Server → Client)
Confirmation that message was saved
```javascript
socket.on('message_sent', (message) => {
  // Message object with _id, sender, receiver, text, createdAt
});
```

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Example using cURL:**
```bash
curl -X GET http://localhost:8080/chat/inbox \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Token Expiration:** 1 day (24 hours)

---

## Error Responses

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | Bad Request | Missing required fields or invalid input |
| 401 | Unauthorized | Invalid or expired token |
| 500 | Server Error | Internal server error |

**Example Error Response:**
```json
{
  "error": "Email and password are required"
}
```

---

## Environment Variables

The following environment variables are required:

```env
PORT=8080                    # Server port
MONGO_URI=<mongodb_connection_string>  # MongoDB connection
JWT_SECRET=<your_secret_key>           # JWT signing secret
NODE_ENV=production          # Environment mode
```

---

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   PORT=8080
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access API docs:**
   ```
   http://localhost:8080/api-docs
   ```

### Testing Endpoints

You can test all endpoints directly from the Swagger UI at `/api-docs`

---

## Frontend Integration

### REST API Calls

```javascript
// Signup
const response = await fetch('https://live-chatting-apis.onrender.com/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

// Get Inbox (with token)
const inbox = await fetch('https://live-chatting-apis.onrender.com/chat/inbox', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Socket.io Connection

```javascript
import io from 'socket.io-client';

const socket = io('https://live-chatting-apis.onrender.com');

// Join room
socket.emit('join_room', userId);

// Send message
socket.emit('send_message', {
  sender: userId,
  receiver: recipientId,
  text: 'Hello!'
});

// Listen for messages
socket.on('receive_message', (data) => {
  console.log('New message:', data);
});
```

---

## Support

For questions or issues, please refer to the API documentation at `/api-docs` or contact support.
