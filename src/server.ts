import { createServer } from "http";
import app from "./app";
import { asyncWrapper, RouteError, sendApiResponse } from "./utils";
import { db, zodErrorFmt } from "./libs";
import { MessageSchema, GetMessageSchema } from "./validators/message.validator";
import { SectionMessageSchema } from "./validators/sectionMessage.validator";

// import { ENV } from "./config";
// import { initializeSocket } from "./libs/socket";
// import { initializeSocketRoutes } from "./routes/socket.routes";
import {
  handleAllMessages,
  handleSendMessage,
  handleSectionAllMessages,
  handleSectionSendMessage,
  handleGradeLevelAllMessages,
  handleGradeLevelSendMessage
} from "./libs/socket.handlers";

const { Server } = require("socket.io"); // Import Socket.IO Server class


const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from this origin and my frontend port = 5173
    methods: ["GET", "POST"], // Allow these HTTP methods
  },
});

export interface sendData {
  success: boolean;
  senderId : string;
  receiverId : string;
  data: any;
  error : string | null,
}

export interface sectionSendData {
  success: boolean;
  sectionId : string;
  error : string | null;
  data: any;
}
io.on("connection", async (socket: any) => {
  console.log("User connected ", socket.id);

  // Direct Message Events
  socket.on("all_messages", (data: any) => handleAllMessages(socket, data));
  socket.on("send_message", (data: any) => handleSendMessage(io, data));

  // Section Message Events
  socket.on("section_all_messages", (sectionId: string) => handleSectionAllMessages(socket, sectionId));
  socket.on("section_send_message", (data: any) => handleSectionSendMessage(io, data));

  // Grade Level Message Events
  socket.on("grade_level_all_messages", (gradeLevelId: string) => handleGradeLevelAllMessages(socket, gradeLevelId));
  socket.on("grade_level_send_message", (data: any) => handleGradeLevelSendMessage(io, data));
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
