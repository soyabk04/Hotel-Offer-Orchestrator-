import type { Request, Response } from "express";

import { getHotelsOfSupplier } from "../services/supplier.service.js";
import type { SupplierName } from "../types/supplier.types.js";

export const getHotelsOfSupplierAController = (
  _req: Request,
  res: Response
) => {
  const supplier: SupplierName = "supplierA";

  const response = getHotelsOfSupplier(supplier);

  return res.status(200).json({
    success: true,
    data: response,
  });
};

export const getHotelsOfSupplierBController = (
  _req: Request,
  res: Response
) => {
  const supplier: SupplierName = "supplierB";

  const response = getHotelsOfSupplier(supplier);

  return res.status(200).json({
    success: true,
    data: response,
  });
};