import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { ObjectId } from 'mongodb';
import authService from "~/services/auth.services";
import { TokenPayload } from "~/models/requests/user.requests";
import { UserVerifyStatus } from "~/constants/enums";
import { MESSAGES } from "~/constants/messages";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { ErrorWithStatus } from "~/models/Errors";
import Conversation from "~/models/schemas/Conversation.schemas";
import conversationService from "~/services/convesation.services";

const initSocketHttpServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      // methods: ["GET", "POST"]
    }
  });

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
}

export default initSocketHttpServer;