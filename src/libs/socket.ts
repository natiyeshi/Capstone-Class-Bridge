// import { Server } from 'socket.io';
// import { Server as HTTPServer } from 'http';
// import { handleSocketAuth, handleSocketDisconnect } from '../controllers/message.controller';

// export const initializeSocket = (httpServer: HTTPServer) => {
//     const io = new Server(httpServer, {
//         cors: {
//             origin: "*", // In production, replace with your frontend URL
//             methods: ["GET", "POST"]
//         },
//         path: '/socket.io' // This ensures socket.io uses a different path than your API routes
//     });

//     // Set up basic socket connection handling
//     io.on('connection', (socket) => {
//         console.log('User connected:', socket.id);

//         // Handle user authentication
//         socket.on('authenticate', (userId: string) => {
//             handleSocketAuth(userId, socket.id);
//         });

//         // Handle disconnection
//         socket.on('disconnect', () => {
//             const userId = handleSocketDisconnect(socket.id);
//             if (userId) {
//                 socket.broadcast.emit('user_offline', userId);
//             }
//         });
//     });

//     return io;
// }; 