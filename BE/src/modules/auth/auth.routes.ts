import { Router } from "express";
import { loginHandler, meHandler, updateProfileHandler, changePasswordHandler } from "./auth.controller";
import { validateBody } from "../../middleware/validate";
import { loginBodySchema, updateProfileBodySchema, changePasswordBodySchema } from "./auth.schemas";
import { requireAuth } from "../../middleware/auth";

export const authRoutes = Router();

authRoutes.post("/login", validateBody(loginBodySchema), loginHandler);
authRoutes.get("/me", requireAuth, meHandler);
authRoutes.put("/profile", requireAuth, validateBody(updateProfileBodySchema), updateProfileHandler);
authRoutes.put("/change-password", requireAuth, validateBody(changePasswordBodySchema), changePasswordHandler);
