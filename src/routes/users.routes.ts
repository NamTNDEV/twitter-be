import { Router } from "express";
import { changePasswordController, emailVerificationController, followController, forgotPasswordController, getMeController, getProfileController, loginController, logoutController, registerController, resendEmailVerificationController, resetPasswordController, unfollowController, updateMeController, verifyForgotPasswordTokenController } from "~/controllers/users.controllers";
import { filterMiddleware } from "~/middlewares/common.middlewares";
import { accessTokenValidation, changePasswordValidation, emailVerifyTokenValidation, followValidation, forgotPasswordValidation, loginValidation, refreshTokenValidation, registerValidation, resetPasswordValidation, unfollowValidation, updateMeValidation, verifiedUserValidation, verifyForgotPasswordTokenValidation } from "~/middlewares/users.middlewares";
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
usersRouter.patch("/me", accessTokenValidation, verifiedUserValidation, updateMeValidation, filterMiddleware<UpdateMeReqBody>(['date_of_birth', 'bio', 'location', 'website', 'username', 'avatar', 'cover_photo']), wrapRequestHandler(updateMeController));
usersRouter.put("/change-password", accessTokenValidation, verifiedUserValidation, changePasswordValidation, wrapRequestHandler(changePasswordController));

usersRouter.get("/:username", wrapRequestHandler(getProfileController));

usersRouter.post("/follow", accessTokenValidation, verifiedUserValidation, followValidation, wrapRequestHandler(followController));
usersRouter.delete("/follow/:followee_id", accessTokenValidation, verifiedUserValidation, unfollowValidation, wrapRequestHandler(unfollowController));

export default usersRouter;