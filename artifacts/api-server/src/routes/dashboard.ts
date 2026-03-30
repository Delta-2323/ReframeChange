import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase.js";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/ai-summary", async (req, res) => {
  try {
    const projectId: number | null = req.body?.projectId ?? null;

    const { data: surveys } = await supabase.from("surveys").select("*");
    const { count: projectsCount } = await supabase.from("projects").select("*", { count: "exact", head: true });
    const { count: messagesCount } = await supabase.from("ai_messages").select("*", { count: "exact", head: true });
    const { count: approvedCount } = await supabase.from("ai_messages").select("*", { count: "exact", head: true }).eq("status", "approved");

    const allSurveys = surveys || [];

    const distributionMap: Record<string, number> = {};
    const thinkingFocusCounts: Record<string, number> = {};
    const orientationCounts: Record<string, number> = {};
    const roleCounts: Record<string, number> = {};

    for (const s of allSurveys) {
      distributionMap[s.mental_model] = (distributionMap[s.mental_model] ?? 0) + 1;
      thinkingFocusCounts[s.thinking_focus] = (thinkingFocusCounts[s.thinking_focus] ?? 0) + 1;
      orientationCounts[s.orientation] = (orientationCounts[s.orientation] ?? 0) + 1;
      roleCounts[s.change_role] = (roleCounts[s.change_role] ?? 0) + 1;
    }

    let projectContext = "";
    if (projectId) {
      const { data: project } = await supabase.from("projects").select("*").eq("id", projectId).single();
      if (project) {
        projectContext = `\nProject Focus: ${project.name}`;
        if (project.bcip_canvas) projectContext += `\nBCIP Canvas: ${project.bcip_canvas.substring(0, 400)}`;
        if (project.change_logic) projectContext += `\nChange Logic: ${project.change_logic.substring(0, 400)}`;
        if (project.change_strategy) projectContext += `\nChange Strategy: ${project.change_strategy.substring(0, 400)}`;
      }
    }

    if (allSurveys.length === 0) {
      return res.json({
        summary: "No stakeholder surveys have been completed yet. Complete some surveys to generate a meaningful analysis of your change landscape.",
        keyInsights: ["No survey data available yet."],
        recommendations: ["Share the stakeholder survey link with your team to begin collecting data."],
        riskFlags: [],
        generatedAt: new Date().toISOString(),
      });
    }

    const distributionText = Object.entries(distributionMap).map(([k, v]) => `${k}: ${v}`).join(", ");
    const thinkingText = Object.entries(thinkingFocusCounts).map(([k, v]) => `${k}: ${v}`).join(", ");
    const orientationText = Object.entries(orientationCounts).map(([k, v]) => `${k}: ${v}`).join(", ");
    const roleText = Object.entries(roleCounts).map(([k, v]) => `${k}: ${v}`).join(", ");

    const prompt = `You are an expert organisational change management consultant specialising in the REM16™ framework. Analyse the following stakeholder data and produce a strategic summary for the change manager.

STAKEHOLDER DATA:
- Total stakeholders surveyed: ${allSurveys.length}
- Active projects: ${projectsCount ?? 0}
- AI messages generated: ${messagesCount ?? 0} (${approvedCount ?? 0} approved)
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

export default router;
