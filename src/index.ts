import express from 'express';
import usersRouter from './routes/users.routes';
import db from './configs/db.configs';
import { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.connect();

app.use('/users', usersRouter);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error !!!");
  res.status(500).json({
    message: error.message || "Internal Server Error",
    data: null,
  });
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, http://localhost:${PORT}`);
});