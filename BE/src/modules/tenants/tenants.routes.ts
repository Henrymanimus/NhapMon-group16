import { Router } from "express";
import {
  createTenantHandler,
  deleteTenantHandler,
  getTenantHandler,
  listTenantsHandler,
  updateTenantHandler,
} from "./tenants.controller";
import { validateBody, validateParams } from "../../middleware/validate";
import {
  createTenantBodySchema,
  tenantIdParamSchema,
  updateTenantBodySchema,
} from "./tenants.schemas";

export const tenantRoutes = Router();

tenantRoutes.get("/", listTenantsHandler);
tenantRoutes.get("/:maNguoiThue", validateParams(tenantIdParamSchema), getTenantHandler);
tenantRoutes.post("/", validateBody(createTenantBodySchema), createTenantHandler);
tenantRoutes.put(
  "/:maNguoiThue",
  validateParams(tenantIdParamSchema),
  validateBody(updateTenantBodySchema),
  updateTenantHandler
);
tenantRoutes.delete(
  "/:maNguoiThue",
  validateParams(tenantIdParamSchema),
  deleteTenantHandler
);
