import { Router } from "express";
import {
  loginHandler,
  meHandler,
  updateProfileHandler,
  changePasswordHandler,
  forgotPasswordHandler,
  registerHandler,
  verifyOtpHandler,
  resetPasswordHandler,
} from "./auth.controller";
import { validateBody } from "../../middleware/validate";
import {
  loginBodySchema,
  updateProfileBodySchema,
  changePasswordBodySchema,
  forgotPasswordBodySchema,
  registerBodySchema,
  verifyOtpBodySchema,
  resetPasswordBodySchema,
} from "./auth.schemas";
import { requireAuth } from "../../middleware/auth";

export const authRoutes = Router();

authRoutes.post("/login", validateBody(loginBodySchema), loginHandler);
authRoutes.post("/register", validateBody(registerBodySchema), registerHandler);
authRoutes.post("/forgot-password", validateBody(forgotPasswordBodySchema), forgotPasswordHandler);
authRoutes.post("/verify-otp", validateBody(verifyOtpBodySchema), verifyOtpHandler);
authRoutes.post("/reset-password", validateBody(resetPasswordBodySchema), resetPasswordHandler);
authRoutes.get("/me", requireAuth, meHandler);
authRoutes.put("/profile", requireAuth, validateBody(updateProfileBodySchema), updateProfileHandler);
authRoutes.put("/change-password", requireAuth, validateBody(changePasswordBodySchema), changePasswordHandler);
