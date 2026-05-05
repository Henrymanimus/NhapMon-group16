import { Router } from "express";
import { loginHandler, meHandler } from "./auth.controller";
import { validateBody } from "../../middleware/validate";
import { loginBodySchema } from "./auth.schemas";
import { requireAuth } from "../../middleware/auth";

export const authRoutes = Router();

authRoutes.post("/login", validateBody(loginBodySchema), loginHandler);
authRoutes.get("/me", requireAuth, meHandler);
