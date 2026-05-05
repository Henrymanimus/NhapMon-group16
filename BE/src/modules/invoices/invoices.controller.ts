import { RequestHandler } from "express";
import { ApiError } from "../../errors/api-error";
import { invoiceSearchQuerySchema } from "./invoices.schemas";
import {
  confirmPayment,
  createInvoice,
  getActiveContractOptions,
  getInvoice,
  listInvoices,
  updateInvoice,
} from "./invoices.service";

function requireOwner(req: Express.Request): string {
  const maChuTro = (req as any).authUser?.maChuTro;
  if (!maChuTro) throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
  return maChuTro;
}

export const listInvoicesHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const filters = invoiceSearchQuerySchema.parse(req.query);
    const result = await listInvoices(maChuTro, filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getInvoiceHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const { maHoaDon } = req.params;
    const data = await getInvoice(maHoaDon, maChuTro);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createInvoiceHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const data = await createInvoice(maChuTro, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const updateInvoiceHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const { maHoaDon } = req.params;
    const data = await updateInvoice(maHoaDon, maChuTro, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const confirmPaymentHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const { maHoaDon } = req.params;
    const data = await confirmPayment(maHoaDon, maChuTro);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getContractOptionsHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const options = await getActiveContractOptions(maChuTro);
    res.json({ items: options });
  } catch (err) {
    next(err);
  }
};
