import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { roomRoutes } from "../modules/rooms/rooms.routes";
import { tenantRoutes } from "../modules/tenants/tenants.routes";
import { contractRoutes } from "../modules/contracts/contracts.routes";
import { invoiceRoutes } from "../modules/invoices/invoices.routes";
import { requireAuth } from "../middleware/auth";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/rooms", requireAuth, roomRoutes);
apiRouter.use("/tenants", requireAuth, tenantRoutes);
apiRouter.use("/contracts", requireAuth, contractRoutes);
apiRouter.use("/invoices", requireAuth, invoiceRoutes);
