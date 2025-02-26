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
import { conversationRoutes } from './routes/conversation.routes';
import initSocketHttpServer from './utils/socket';
import envConfig from './constants/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const httpServer = createServer(app);
const PORT = envConfig.server.PORT;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
})

initUploadsDir();

app.use(limiter);
app.use(helmet())
app.use(cors(
  {
    origin: envConfig.server.CLIENT_URL,
  }
));
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

initSocketHttpServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, http://localhost:${PORT}`);
});