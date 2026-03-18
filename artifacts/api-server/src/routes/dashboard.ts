import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { surveysTable, projectsTable, aiMessagesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (_req, res) => {
  try {
    const [surveysCount] = await db.select({ count: sql<number>`count(*)::int` }).from(surveysTable);
    const [projectsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(projectsTable);
    const [messagesCount] = await db.select({ count: sql<number>`count(*)::int` }).from(aiMessagesTable);
    const [approvedCount] = await db.select({ count: sql<number>`count(*)::int` }).from(aiMessagesTable).where(eq(aiMessagesTable.status, "approved"));

    const distribution = await db
      .select({
        mentalModel: surveysTable.mentalModel,
        count: sql<number>`count(*)::int`,
      })
      .from(surveysTable)
      .groupBy(surveysTable.mentalModel)
      .orderBy(sql`count(*) DESC`);

    res.json({
      totalSurveys: surveysCount?.count ?? 0,
      totalProjects: projectsCount?.count ?? 0,
      totalMessages: messagesCount?.count ?? 0,
      approvedMessages: approvedCount?.count ?? 0,
      mentalModelDistribution: distribution,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
