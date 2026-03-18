import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { surveysTable, projectsTable, aiMessagesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/ai-summary", async (req, res) => {
  try {
    const projectId: number | null = req.body?.projectId ?? null;

    const surveys = await db.select().from(surveysTable);
    const [projectsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(projectsTable);
    const [messagesCount] = await db.select({ count: sql<number>`count(*)::int` }).from(aiMessagesTable);
    const [approvedCount] = await db.select({ count: sql<number>`count(*)::int` }).from(aiMessagesTable).where(eq(aiMessagesTable.status, "approved"));

    const distribution = await db
      .select({ mentalModel: surveysTable.mentalModel, count: sql<number>`count(*)::int` })
      .from(surveysTable)
      .groupBy(surveysTable.mentalModel)
      .orderBy(sql`count(*) DESC`);

    const thinkingFocusCounts: Record<string, number> = {};
    const orientationCounts: Record<string, number> = {};
    const roleCounts: Record<string, number> = {};
    for (const s of surveys) {
      thinkingFocusCounts[s.thinkingFocus] = (thinkingFocusCounts[s.thinkingFocus] ?? 0) + 1;
      orientationCounts[s.orientation] = (orientationCounts[s.orientation] ?? 0) + 1;
      roleCounts[s.changeRole] = (roleCounts[s.changeRole] ?? 0) + 1;
    }

    let projectContext = "";
    if (projectId) {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
      if (project) {
        projectContext = `\nProject Focus: ${project.name}`;
        if (project.bcipCanvas) projectContext += `\nBCIP Canvas: ${project.bcipCanvas.substring(0, 400)}`;
        if (project.changeLogic) projectContext += `\nChange Logic: ${project.changeLogic.substring(0, 400)}`;
        if (project.changeStrategy) projectContext += `\nChange Strategy: ${project.changeStrategy.substring(0, 400)}`;
      }
    }

    if (surveys.length === 0) {
      return res.json({
        summary: "No stakeholder surveys have been completed yet. Complete some surveys to generate a meaningful analysis of your change landscape.",
        keyInsights: ["No survey data available yet."],
        recommendations: ["Share the stakeholder survey link with your team to begin collecting data."],
        riskFlags: [],
        generatedAt: new Date().toISOString(),
      });
    }

    const distributionText = distribution.map(d => `${d.mentalModel}: ${d.count}`).join(", ");
    const thinkingText = Object.entries(thinkingFocusCounts).map(([k, v]) => `${k}: ${v}`).join(", ");
    const orientationText = Object.entries(orientationCounts).map(([k, v]) => `${k}: ${v}`).join(", ");
    const roleText = Object.entries(roleCounts).map(([k, v]) => `${k}: ${v}`).join(", ");

    const prompt = `You are an expert organisational change management consultant specialising in the REM16™ framework. Analyse the following stakeholder data and produce a strategic summary for the change manager.

STAKEHOLDER DATA:
- Total stakeholders surveyed: ${surveys.length}
- Active projects: ${projectsCount?.count ?? 0}
- AI messages generated: ${messagesCount?.count ?? 0} (${approvedCount?.count ?? 0} approved)
- Mental model distribution: ${distributionText}
- Thinking focus breakdown: ${thinkingText}
- Orientation (Eager vs Cautious): ${orientationText}
- Change role (Rockstar vs Roadie): ${roleText}
${projectContext}

Based on this data, provide a strategic analysis in JSON format with exactly these fields:
{
  "summary": "A 3-4 sentence executive summary of the overall change readiness and stakeholder landscape",
  "keyInsights": ["3-5 specific insights about the stakeholder group derived from the mental model data"],
  "recommendations": ["3-5 concrete, actionable recommendations for the change manager on how to approach this group"],
  "riskFlags": ["1-4 specific risk factors or watch-outs the change manager should be aware of, or empty array if no risks"]
}

Respond only with valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed: { summary?: string; keyInsights?: string[]; recommendations?: string[]; riskFlags?: string[] } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    res.json({
      summary: parsed.summary ?? "Unable to generate summary.",
      keyInsights: parsed.keyInsights ?? [],
      recommendations: parsed.recommendations ?? [],
      riskFlags: parsed.riskFlags ?? [],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating AI summary:", error);
    res.status(500).json({ error: "Failed to generate AI summary" });
  }
});

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
