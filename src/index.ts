import express from 'express';
import usersRouter from './routes/users.routes';
import db from './configs/db.configs';
import { defaultErrorHandler } from './middlewares/errors.middlewares';
import { config } from 'dotenv';
import { mediasRoutes } from './routes/medias.routes';
import { staticRoutes } from './routes/static.routes';
import { initUploadsDir } from './utils/file';
import cors from 'cors';
import { tweetsRouter } from './routes/tweet.routes';
import { bookmarksRoutes } from './routes/bookmarks.routes';
import { likesRoutes } from './routes/likes.routes';
import { searchRoutes } from './routes/search.routes';
import { createServer } from "http";
import { Server } from "socket.io";
import conversationService from './services/convesation.services';
import { ObjectId } from 'mongodb';
import { conversationRoutes } from './routes/conversation.routes';

config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    // methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 8080;

initUploadsDir();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
db.initialize();

// app.use('/static', express.static(ImagesDir));
// app.use(express.static(VideosDir));

app.use('/users', usersRouter);
app.use('/medias', mediasRoutes);
app.use('/static', staticRoutes);
app.use('/tweets', tweetsRouter);
app.use('/bookmarks', bookmarksRoutes);
app.use('/likes', likesRoutes);
app.use('/search', searchRoutes);
app.use('/conversations', conversationRoutes);
app.use(defaultErrorHandler);

const connectedUsers: {
  [key: string]: {
    socketId: string;
  }
} = {}

io.on("connection", (socket) => {
  const connectedUserId = socket.handshake.auth.user_id;
  if (!connectedUserId) {
    return;
  }

  connectedUsers[connectedUserId] = {
    socketId: socket.id
  };

  socket.on("chat message", async (payload: { to: string, from: string, message: string }) => {
    const receiverSocketId = connectedUsers[payload.to]?.socketId;
    if (receiverSocketId) {
      await conversationService.saveConservation({
        senderId: new ObjectId(payload.from),
        receiverId: new ObjectId(payload.to),
        message: payload.message
      })

      socket.to(receiverSocketId).emit("receive message", {
        from_id: connectedUserId,
        message: payload.message
      });
    }
  });

  socket.on("disconnect", () => {
    delete connectedUsers[connectedUserId];
  }
  );
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, http://localhost:${PORT}`);
});