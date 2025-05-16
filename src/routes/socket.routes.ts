import { Router } from "express";
import { Server } from "socket.io";
import db from "../libs/prisma-client";

const router = Router();

// Store user socket connections
const userSockets = new Map<string, string>();

export const initializeSocketRoutes = (io: Server) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Handle user authentication and store their socket
        socket.on('authenticate', (userId: string) => {
            userSockets.set(userId, socket.id);
            console.log(`User ${userId} authenticated with socket ${socket.id}`);
        });

        // Handle private messages
        socket.on('private_message', async (data: { 
            senderId: string, 
            receiverId: string, 
            content: string 
        }) => {
            try {
                // Save message to database
                const message = await db.message.create({
                    data: {
                        content: data.content,
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        seen: false
                    },
                    include: {
                        sender: true,
                        receiver: true
                    }
                });

                // Get receiver's socket ID
                const receiverSocketId = userSockets.get(data.receiverId);
                
                // Emit to sender
                socket.emit('new_message', message);
                
                // Emit to receiver if online
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('new_message', message);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', 'Failed to send message');
            }
        });

        // Handle message seen status
        socket.on('message_seen', async (messageId: string) => {
            try {
                const message = await db.message.update({
                    where: { id: messageId },
                    data: { seen: true },
                    include: {
                        sender: true,
                        receiver: true
                    }
                });

                // Notify sender that their message was seen
                const senderSocketId = userSockets.get(message.senderId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('message_seen', message);
                }
            } catch (error) {
                console.error('Error updating message seen status:', error);
                socket.emit('error', 'Failed to update message status');
            }
        });

        // Handle typing status
        socket.on('typing', (data: { senderId: string, receiverId: string, isTyping: boolean }) => {
            const receiverSocketId = userSockets.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_typing', {
                    userId: data.senderId,
                    isTyping: data.isTyping
                });
            }
        });

        // Handle online status
        socket.on('online_status', (userId: string) => {
            socket.broadcast.emit('user_online', userId);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            // Remove user from userSockets map and notify others
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    socket.broadcast.emit('user_offline', userId);
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        });
    });
};

export default router; 