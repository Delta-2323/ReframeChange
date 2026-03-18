import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { surveysTable } from "@workspace/db";
import { SubmitSurveyBody, GetSurveyParams } from "@workspace/api-zod";
import { getMentalModel } from "../lib/rem16.js";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const body = SubmitSurveyBody.parse(req.body);
    const { thinkingFocus, orientation, changeRole } = body;
    const mentalModelData = getMentalModel(
      thinkingFocus as "Proof" | "Process" | "People" | "Possibility",
      orientation as "Eager" | "Cautious",
      changeRole as "Rockstar" | "Roadie"
    );

    const [survey] = await db.insert(surveysTable).values({
      stakeholderName: body.stakeholderName,
      role: body.role,
      thinkingFocus: body.thinkingFocus,
      orientation: body.orientation,
      changeRole: body.changeRole,
      mentalModel: mentalModelData.name,
      mentalModelDescription: mentalModelData.description,
      projectId: body.projectId ?? null,
    }).returning();

    res.status(201).json(survey);
  } catch (error) {
    console.error("Error submitting survey:", error);
    res.status(400).json({ error: "Invalid survey data" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const surveys = await db.select().from(surveysTable).orderBy(surveysTable.createdAt);
    res.json({ surveys });
  } catch (error) {
    console.error("Error fetching surveys:", error);
    res.status(500).json({ error: "Failed to fetch surveys" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetSurveyParams.parse({ id: Number(req.params.id) });
    const [survey] = await db.select().from(surveysTable).where(eq(surveysTable.id, id));
    if (!survey) {
      res.status(404).json({ error: "Survey not found" });
      return;
    }
    res.json(survey);
  } catch (error) {
    console.error("Error fetching survey:", error);
    res.status(500).json({ error: "Failed to fetch survey" });
  }
});

export default router;
