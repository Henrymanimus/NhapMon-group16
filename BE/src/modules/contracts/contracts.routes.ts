import { Router } from "express";
import { validateBody, validateParams } from "../../middleware/validate";
import {
  contractIdParamSchema,
  contractTenantParamSchema,
  createContractBodySchema,
  leaveTenantBodySchema,
  terminateContractBodySchema,
  updateContractBodySchema,
} from "./contracts.schemas";
import {
  createContractHandler,
  getContractFormOptionsHandler,
  getContractHandler,
  leaveTenantInContractHandler,
  listContractsHandler,
  terminateContractHandler,
  updateContractHandler,
} from "./contracts.controller";

export const contractRoutes = Router();

contractRoutes.get("/", listContractsHandler);
contractRoutes.get("/options", getContractFormOptionsHandler);
contractRoutes.get("/:maHopDong", validateParams(contractIdParamSchema), getContractHandler);
contractRoutes.post("/", validateBody(createContractBodySchema), createContractHandler);
contractRoutes.put(
  "/:maHopDong",
  validateParams(contractIdParamSchema),
  validateBody(updateContractBodySchema),
  updateContractHandler
);
contractRoutes.post(
  "/:maHopDong/terminate",
  validateParams(contractIdParamSchema),
  validateBody(terminateContractBodySchema),
  terminateContractHandler
);
contractRoutes.post(
  "/:maHopDong/tenants/:maNguoiThue/leave",
  validateParams(contractTenantParamSchema),
  validateBody(leaveTenantBodySchema),
  leaveTenantInContractHandler
);
