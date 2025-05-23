import { createServer } from "http";
import app from "./app";

// import { ENV } from "./config";
// import { initializeSocket } from "./libs/socket";
// import { initializeSocketRoutes } from "./routes/socket.routes";

const server = createServer(app);

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
