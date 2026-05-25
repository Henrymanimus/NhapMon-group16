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
  confirmContractSignedHandler,
  deleteContractHandler,
  getContractFormOptionsHandler,
  getContractHandler,
  leaveTenantInContractHandler,
  listContractsHandler,
  previewContractPdfHandler,
  terminateContractHandler,
  updateContractHandler,
} from "./contracts.controller";

export const contractRoutes = Router();

contractRoutes.get("/", listContractsHandler);
contractRoutes.get("/options", getContractFormOptionsHandler);
contractRoutes.get("/:maHopDong/preview.pdf", validateParams(contractIdParamSchema), previewContractPdfHandler);
contractRoutes.get("/:maHopDong", validateParams(contractIdParamSchema), getContractHandler);
contractRoutes.post("/", validateBody(createContractBodySchema), createContractHandler);
contractRoutes.put(
  "/:maHopDong",
  validateParams(contractIdParamSchema),
  validateBody(updateContractBodySchema),
  updateContractHandler
);
contractRoutes.delete(
  "/:maHopDong",
  validateParams(contractIdParamSchema),
  deleteContractHandler
);
contractRoutes.post(
  "/:maHopDong/terminate",
  validateParams(contractIdParamSchema),
  validateBody(terminateContractBodySchema),
  terminateContractHandler
);
contractRoutes.post(
  "/:maHopDong/sign",
  validateParams(contractIdParamSchema),
  confirmContractSignedHandler
);
contractRoutes.post(
  "/:maHopDong/tenants/:maNguoiThue/leave",
  validateParams(contractTenantParamSchema),
  validateBody(leaveTenantBodySchema),
  leaveTenantInContractHandler
);
