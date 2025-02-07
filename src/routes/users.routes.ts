import { Router } from "express";
import { emailVerificationController, forgotPasswordController, loginController, logoutController, registerController, resendEmailVerificationController, verifyForgotPasswordTokenController } from "~/controllers/users.controllers";
import { accessTokenValidation, emailVerifyTokenValidation, forgotPasswordValidation, loginValidation, refreshTokenValidation, registerValidation, verifyForgotPasswordTokenValidation } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";
const usersRouter = Router();

usersRouter.get("/", (req, res) => {
  res.send("Hello Users Router!");
})

usersRouter.post("/login", loginValidation, loginController);
usersRouter.post("/register", registerValidation, wrapRequestHandler(registerController));
usersRouter.post("/logout", accessTokenValidation, refreshTokenValidation, wrapRequestHandler(logoutController));

usersRouter.post("/verify-email", emailVerifyTokenValidation, wrapRequestHandler(emailVerificationController));
usersRouter.post("/resend-verify-email", accessTokenValidation, wrapRequestHandler(resendEmailVerificationController));

usersRouter.post("/forgot-password", forgotPasswordValidation, wrapRequestHandler(forgotPasswordController));
usersRouter.post("/verify-forgot-password-token", verifyForgotPasswordTokenValidation, wrapRequestHandler(verifyForgotPasswordTokenController));

export default usersRouter;