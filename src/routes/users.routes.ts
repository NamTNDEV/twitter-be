import { Router } from "express";
import { loginController } from "~/controllers/users.controllers";
import { loginValidation } from "~/middlewares/users.middlewares";
const usersRouter = Router();

usersRouter.get("/", (req, res) => {
  res.send("Hello Users Router!");
})

usersRouter.post("/login", loginValidation, loginController);


export default usersRouter;