import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

class SocketService {
    private io: Server;
    private userSockets: Map<string, string> = new Map();

    constructor() {
        this.io = null as any;
    }

    initialize(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:3000',
                methods: ['GET', 'POST']
            },
            path: '/socket.io'
        });

        this.io.on('connection', (socket: Socket) => {
            console.log('New socket connection:', socket.id);

            socket.on('authenticate', (userId: string) => {
                this.handleSocketAuth(userId, socket.id);
            });

            socket.on('disconnect', () => {
                this.handleSocketDisconnect(socket.id);
            });
        });

        console.log('Socket.IO server initialized');
    }

    private handleSocketAuth(userId: string, socketId: string) {
        this.userSockets.set(userId, socketId);
        console.log(`User ${userId} authenticated with socket ${socketId}`);
    }

    private handleSocketDisconnect(socketId: string) {
        for (const [userId, id] of this.userSockets.entries()) {
            if (id === socketId) {
                this.userSockets.delete(userId);
                console.log(`User ${userId} disconnected`);
                // Notify other users that this user went offline
                this.io.emit('user_offline', userId);
                return userId;
            }
        }
        return null;
    }

    // Public methods for other services to use
    emitNewMessage(message: any) {
        const { senderId, receiverId } = message;
        const senderSocketId = this.userSockets.get(senderId);
        const receiverSocketId = this.userSockets.get(receiverId);

        console.log('Socket Debug - Message Creation:');
        console.log('Sender Socket ID:', senderSocketId);
        console.log('Receiver Socket ID:', receiverSocketId);
        console.log('Message Data:', message);

        if (senderSocketId) {
            console.log('Emitting to sender socket:', senderSocketId);
            this.io.to(senderSocketId).emit('new_message', message);
        }

        if (receiverSocketId) {
            console.log('Emitting to receiver socket:', receiverSocketId);
            this.io.to(receiverSocketId).emit('new_message', message);
        }
    }

    emitMessageSeen(message: any) {
        const senderSocketId = this.userSockets.get(message.senderId);
        if (senderSocketId) {
            this.io.to(senderSocketId).emit('message_seen', message);
        }
    }

    getIO(): Server {
        if (!this.io) {
            throw new Error('Socket.IO not initialized');
        }
        return this.io;
    }
}

// Export a singleton instance
export const socketService = new SocketService(); 