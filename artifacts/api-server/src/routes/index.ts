import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import surveysRouter from "./surveys.js";
import projectsRouter from "./projects.js";
import aiMessagesRouter from "./aiMessages.js";
import dashboardRouter from "./dashboard.js";
import storageRouter from "./storage.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/surveys", surveysRouter);
router.use("/projects", projectsRouter);
router.use("/messages", aiMessagesRouter);
router.use("/dashboard", dashboardRouter);
router.use(storageRouter);

export default router;
