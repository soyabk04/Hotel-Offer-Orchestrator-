import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
};