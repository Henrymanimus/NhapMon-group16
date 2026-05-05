import { RequestHandler } from "express";
import {
  createTenant,
  deleteTenant,
  getTenant,
  listTenants,
  updateTenant,
} from "./tenants.service";

export const listTenantsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const items = await listTenants();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

export const getTenantHandler: RequestHandler = async (req, res, next) => {
  try {
    const { maNguoiThue } = req.params as { maNguoiThue: string };
    const data = await getTenant(maNguoiThue);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createTenantHandler: RequestHandler = async (req, res, next) => {
  try {
    const item = await createTenant(req.body);
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
};

export const updateTenantHandler: RequestHandler = async (req, res, next) => {
  try {
    const { maNguoiThue } = req.params as { maNguoiThue: string };
    const item = await updateTenant(maNguoiThue, req.body);
    res.json({ item });
  } catch (err) {
    next(err);
  }
};

export const deleteTenantHandler: RequestHandler = async (req, res, next) => {
  try {
    const { maNguoiThue } = req.params as { maNguoiThue: string };
    await deleteTenant(maNguoiThue);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
