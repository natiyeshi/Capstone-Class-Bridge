import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

const MessageList = ({ selectedConversation }: MessageListProps) => {
  const socketRef = useRef<SocketIOClient.Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user?.user?.id) return;

    // Use the correct API URL from environment
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    console.log('Initializing socket connection...', socketUrl);
    
    // Initialize socket connection
    socketRef.current = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true
    });

    // Socket event listeners
    socketRef.current.on('connect', () => {
      console.log('Socket connected successfully');
      console.log('Socket ID:', socketRef.current?.id);
      
      // Authenticate the socket after connection
      if (socketRef.current && user?.user?.id) {
        console.log('Authenticating socket for user:', user.user.id);
        socketRef.current.emit('authenticate', user.user.id);
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection error. Please refresh the page.');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        socketRef.current?.connect();
      }
    });

    socketRef.current.on('new_message', (message: Message) => {
      console.log('Received new message:', message);
      
      // Check if this message is from the current conversation
      if (message.senderId === selectedConversation?.id || message.receiverId === selectedConversation?.id) {
        setMessagesData(prev => {
          if (!prev) return {
            success: true,
            message: "Message received",
            result: [message]
          };
          
          // Check if message already exists to avoid duplicates
          const messageExists = prev.result.some(m => m.id === message.id);
          if (messageExists) return prev;
          
          return {
            ...prev,
            result: [...prev.result, message]
          };
        });
      }
    });

    socketRef.current.on('message_seen', (message: Message) => {
      console.log('Message seen:', message);
      if (message.senderId === selectedConversation?.id || message.receiverId === selectedConversation?.id) {
        setMessagesData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            result: prev.result.map(m => 
              m.id === message.id ? { ...m, seen: true } : m
            )
          };
        });
      }
    });

    socketRef.current.on('user_offline', (userId: string) => {
      console.log('User went offline:', userId);
      // You can add UI feedback here if needed
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection...');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?.user?.id, selectedConversation?.id]);

  // ... rest of the component remains the same ...
};

export default MessageList; 