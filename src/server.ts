import { createServer } from "http";
import app from "./app";
import { asyncWrapper, RouteError, sendApiResponse } from "./utils";
import { db, zodErrorFmt } from "./libs";
import { MessageSchema, GetMessageSchema } from "./validators/message.validator";

// import { ENV } from "./config";
// import { initializeSocket } from "./libs/socket";
// import { initializeSocketRoutes } from "./routes/socket.routes";

const { Server } = require("socket.io"); // Import Socket.IO Server class


const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from this origin and my frontend port = 5173
    methods: ["GET", "POST"], // Allow these HTTP methods
  },
});

interface sendData {
  success: boolean;
  senderId : string;
  receiverId : string;
  data: any;
}

io.on("connection", async (socket: any) => {
  console.log("User connected ", socket.id); // Log the socket ID of the connected user

  // Handle all_messages event
  socket.on("all_messages", async (data: any) => {
    try {
      // Fetch all messages where the user is either sender or receiver
      const messages = await db.message.findMany({
        where: {
          OR: [
            { receiverId: data.receiverId, senderId: data.senderId },
            { receiverId: data.senderId, senderId: data.receiverId }
          ],
        },
        include: {
          receiver: true,
          sender: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Send the messages back to the client
      socket.emit("all_messages_response", {
        success: true,
        data: messages
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      socket.emit("all_messages_response", {
        success: false,
        error: "Failed to fetch messages"
      });
    }
  });

  // Listen for "send_message" events from the connected client
  socket.on("send_message", async (data: any ) => {
  
    console.log("Message Received ", data); // Log the received message data

    const bodyValidation = MessageSchema.safeParse(data);
   
   if (!bodyValidation.success)
     {
        const response: sendData = {
          success: false,
          senderId: data.senderId,
          receiverId: data.receiverId,
          data: null
        }      
        io.emit("receive_message", response);
        return;
     }

    // Perform sentiment analysis

    const messageData = await db.message.create({
        data: {
            ...bodyValidation.data,
        },
        include: {
            sender: true,
            receiver: true
        }
    });

      // Emit the received message data to all connected clients
      io.emit("receive_message", {
        success: true,
        senderId: data.senderId,
        receiverId: data.receiverId,
        data: messageData
      } as sendData);
  });

  

});

// Initialize Socket.IO
// const io = initializeSocket(server);
// Initialize socket routes
// initializeSocketRoutes(io);
// app.set('io', io); // Make io accessible in routes

const PORT = 4000;
// const PORT = ENV.PORT;

server.listen(PORT, () => {
  console.log("Server is running on port: ", PORT);
});
