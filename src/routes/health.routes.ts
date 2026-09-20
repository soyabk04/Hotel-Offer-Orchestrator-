import { Router } from "express";

import { healthController } from "../controller/health.controller.js";

const healthRouter = Router();

healthRouter.get("/", healthController);

export default healthRouter;