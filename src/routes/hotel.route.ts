import { Router } from "express";
import { getHotelsController } from "../controller/hotel.controller.js";

const hotelRouter = Router();

hotelRouter.get("/", getHotelsController);

export default hotelRouter;