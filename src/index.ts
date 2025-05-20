import express from 'express';
import { createServer } from 'http';
import { socketService } from './services/socket.service';

const app = express();
const httpServer = createServer(app);

// Initialize socket service
socketService.initialize(httpServer);

// ... rest of your server setup ...

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 