import { Router } from "express";
import { emailVerificationController, forgotPasswordController, getMeController, loginController, logoutController, registerController, resendEmailVerificationController, resetPasswordController, updateMeController, verifyForgotPasswordTokenController } from "~/controllers/users.controllers";
import { filterMiddleware } from "~/middlewares/common.middlewares";
import { accessTokenValidation, emailVerifyTokenValidation, forgotPasswordValidation, loginValidation, refreshTokenValidation, registerValidation, resetPasswordValidation, updateMeValidation, verifiedUserValidation, verifyForgotPasswordTokenValidation } from "~/middlewares/users.middlewares";
import { UpdateMeReqBody } from "~/models/requests/user.requests";
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
usersRouter.post("/reset-password", resetPasswordValidation, wrapRequestHandler(resetPasswordController));

usersRouter.get("/me", accessTokenValidation, wrapRequestHandler(getMeController));
usersRouter.patch("/me", accessTokenValidation, verifiedUserValidation, updateMeValidation, filterMiddleware<UpdateMeReqBody>(['name', 'date_of_birth', 'bio', 'location', 'website', 'username', 'avatar', 'cover_photo']), wrapRequestHandler(updateMeController));

export default usersRouter;