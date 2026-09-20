import type { Request, Response } from "express";

import { getHotelsOfSupplier } from "../services/supplier.service.js";
import type { SupplierName } from "../types/supplier.types.js";

export const healthController = async (
  _req: Request,
  res: Response
) => {
  const suppliers = [
    "supplierA",
    "supplierB",
  ] as SupplierName[];

  const results = await Promise.allSettled(
    suppliers.map((supplier) =>
      Promise.resolve(getHotelsOfSupplier(supplier))
    )
  );

  const supplierAHealthy =
    results[0]?.status === "fulfilled";

  const supplierBHealthy =
    results[1]?.status === "fulfilled";

  const healthy =
    supplierAHealthy && supplierBHealthy;

  return res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? "healthy" : "unhealthy",
    suppliers: {
      supplierA: supplierAHealthy
        ? "healthy"
        : "unhealthy",
      supplierB: supplierBHealthy
        ? "healthy"
        : "unhealthy",
    },
  });
};