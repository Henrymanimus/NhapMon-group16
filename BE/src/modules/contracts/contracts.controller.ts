import { RequestHandler } from "express";
import { ApiError } from "../../errors/api-error";
import {
  createContract,
  getContract,
  getContractFormOptions,
  listContracts,
  markTenantLeft,
  terminateContract,
  updateContract,
} from "./contracts.service";
import { contractSearchQuerySchema } from "./contracts.schemas";

function requireOwner(req: Express.Request): string {
  if (!req.authUser) {
    throw new ApiError(401, "UNAUTHORIZED", "Missing authentication context");
  }
  return req.authUser.maChuTro;
}

export const listContractsHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const filters = contractSearchQuerySchema.parse(req.query);
    const items = await listContracts(maChuTro, filters);
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

export const getContractHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const { maHopDong } = req.params as { maHopDong: string };
    const data = await getContract(maHopDong, maChuTro);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getContractFormOptionsHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const data = await getContractFormOptions(maChuTro);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createContractHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const item = await createContract(req.body, maChuTro);
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
};

export const updateContractHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const { maHopDong } = req.params as { maHopDong: string };
    const item = await updateContract(maHopDong, req.body, maChuTro);
    res.json({ item });
  } catch (err) {
    next(err);
  }
};

export const terminateContractHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const { maHopDong } = req.params as { maHopDong: string };
    const item = await terminateContract(maHopDong, req.body, maChuTro);
    res.json({ item });
  } catch (err) {
    next(err);
  }
};

export const leaveTenantInContractHandler: RequestHandler = async (req, res, next) => {
  try {
    const maChuTro = requireOwner(req);
    const { maHopDong, maNguoiThue } = req.params as {
      maHopDong: string;
      maNguoiThue: string;
    };
    const item = await markTenantLeft(maHopDong, maNguoiThue, req.body.ngayRoiDi ?? null, maChuTro);
    res.json({ item });
  } catch (err) {
    next(err);
  }
};
