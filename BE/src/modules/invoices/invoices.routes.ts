import { Router } from "express";
import { validateBody, validateParams } from "../../middleware/validate";
import { invoiceIdParamSchema, createInvoiceBodySchema, updateInvoiceBodySchema } from "./invoices.schemas";
import {
  listInvoicesHandler,
  getInvoiceHandler,
  createInvoiceHandler,
  updateInvoiceHandler,
  confirmPaymentHandler,
  getContractOptionsHandler,
} from "./invoices.controller";

export const invoiceRoutes = Router();

invoiceRoutes.get("/", listInvoicesHandler);
invoiceRoutes.get("/contract-options", getContractOptionsHandler);
invoiceRoutes.get("/:maHoaDon", validateParams(invoiceIdParamSchema), getInvoiceHandler);
invoiceRoutes.post("/", validateBody(createInvoiceBodySchema), createInvoiceHandler);
invoiceRoutes.put(
  "/:maHoaDon",
  validateParams(invoiceIdParamSchema),
  validateBody(updateInvoiceBodySchema),
  updateInvoiceHandler
);
invoiceRoutes.post(
  "/:maHoaDon/pay",
  validateParams(invoiceIdParamSchema),
  confirmPaymentHandler
);
