import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../errors/api-error";
import { logger } from "../config/logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const firstIssueMessage = err.issues[0]?.message ?? "Dữ liệu không hợp lệ";
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: firstIssueMessage,
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    },
  });
};
