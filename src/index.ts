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

config();
const app = express();
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
app.use(defaultErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, http://localhost:${PORT}`);
});