import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import aiMessagesRouter from "./aiMessages.js";
import dashboardRouter from "./dashboard.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/messages", aiMessagesRouter);
router.use("/dashboard", dashboardRouter);

export default router;
