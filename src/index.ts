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
import Conversation from './models/schemas/Conversation.schemas';
import authService from './services/auth.services';
import { TokenPayload } from './models/requests/user.requests';
import { UserVerifyStatus } from './constants/enums';
import { ErrorWithStatus } from './models/Errors';
import { HTTP_STATUS } from './constants/httpStatus';
import { MESSAGES } from './constants/messages';

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

io.use(async (socket, next) => {
  const { authorization } = socket.handshake.auth;
  const accessToken = authorization?.split(" ")[1];
  try {
    const decode_authorization = await authService.verifyAccessToken(accessToken);
    const { verify_status } = decode_authorization as TokenPayload;
    if (verify_status !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    socket.handshake.auth.user_id = (decode_authorization as TokenPayload).user_id;
    socket.handshake.auth.access_token = accessToken;

    next();
  } catch (error) {
    next({
      message: MESSAGES.UNAUTHORIZED,
      name: "UnauthorizedError",
      data: error
    })
  }

});

io.on("connection", (socket) => {
  const connectedUserId = socket.handshake.auth.user_id;
  if (!connectedUserId) {
    return;
  }

  connectedUsers[connectedUserId] = {
    socketId: socket.id
  };

  socket.use(async (packet, next) => {
    const { access_token } = socket.handshake.auth;
    try {
      await authService.verifyAccessToken(access_token)
    } catch (error) {
      next(new Error(MESSAGES.UNAUTHORIZED))
    }
    next();
  })

  socket.on('error', (error) => {
    if (error.message === MESSAGES.UNAUTHORIZED) {
      socket.disconnect();
    }
  });

  socket.on("send_message", async (payload: { receiverId: string, senderId: string, message: string, createdAt: Date, updatedAt: Date }) => {
    const { receiverId, senderId, message, createdAt, updatedAt } = payload;
    const receiverSocketId = connectedUsers[receiverId]?.socketId;

    const newConversation: Conversation = {
      senderId: new ObjectId(senderId),
      receiverId: new ObjectId(receiverId),
      message,
      createdAt,
      updatedAt,
    }

    await conversationService.saveConservation(newConversation);

    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("receive_message", {
        ...newConversation,
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