import { RequestHandler } from "express";
import { ApiError } from "../errors/api-error";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new ApiError(404, "NOT_FOUND", "Route not found"));
};
