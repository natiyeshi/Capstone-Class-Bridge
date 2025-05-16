// Connect to socket server
const socket = io('http://localhost:4000/socket.io');

// Authenticate when user logs in
socket.emit('authenticate', userId);

// Listen for events
socket.on('new_message', (message) => {
    // Handle new message
});

socket.on('message_seen', (message) => {
    // Handle message seen status
});

socket.on('user_offline', (userId) => {
    // Handle user offline status
});

// Your existing API calls will now automatically trigger socket events
// For example:
fetch('/api/v1/message', {
    method: 'POST',
    body: JSON.stringify({
        content: 'Hello!',
        senderId: 'your-id',
        receiverId: 'other-user-id'
    })
});
// This will automatically emit a 'new_message' event to both sender and receiver