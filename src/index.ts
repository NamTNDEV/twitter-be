import express from 'express';
import usersRouter from './routes/users.routes';
import db from './configs/db.configs';
import { defaultErrorHandler } from './middlewares/errors.middlewares';
import { config } from 'dotenv';
import { mediasRoutes } from './routes/medias.routes';
import { initUploadsDir } from './utils/file';

config();
const app = express();
const PORT = process.env.PORT || 8080;

initUploadsDir();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
db.connect();

app.use('/users', usersRouter);
app.use('/medias', mediasRoutes);
app.use(defaultErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, http://localhost:${PORT}`);
});