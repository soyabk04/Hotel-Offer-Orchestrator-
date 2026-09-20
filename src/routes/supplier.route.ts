import { Router } from "express";
import {
  getHotelsOfSupplierAController,
   getHotelsOfSupplierBController,
} from "../controller/supplier.controller.js";

const supplierRouter = Router();

supplierRouter.get(
  "/supplierA/hotels",
  getHotelsOfSupplierAController
);

supplierRouter.get(
  "/supplierB/hotels",
  getHotelsOfSupplierBController
);

export default supplierRouter;