// Connect to socket server
const socket = io('http://localhost:4000/socket.io');
console.log('Socket connection initialized');

// Authenticate when user logs in
socket.on('connect', () => {
    console.log('Socket connected with ID:', socket.id);
});

socket.emit('authenticate', userId);
console.log('Authentication sent for user:', userId);

// Listen for events
socket.on('new_message', (message) => {
    console.log('Received new message:', message);
    // Handle new message
});

socket.on('message_seen', (message) => {
    console.log('Message seen notification:', message);
    // Handle message seen status
});

socket.on('user_offline', (userId) => {
    console.log('User went offline:', userId);
    // Handle user offline status
});

socket.on('disconnect', () => {
    console.log('Socket disconnected');
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
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
}).then(response => {
    console.log('Message sent successfully:', response);
}).catch(error => {
    console.error('Error sending message:', error);
});
// This will automatically emit a 'new_message' event to both sender and receiver