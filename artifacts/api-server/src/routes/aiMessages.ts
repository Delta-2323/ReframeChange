import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase.js";
import { openai } from "@workspace/integrations-openai-ai-server";
import { sendEmail } from "../lib/email.js";

const router: IRouter = Router();

async function generateAIMessage(
  stakeholderName: string,
  mentalModel: string,
  mentalModelDescription: string,
  role: string,
  projectName: string,
  bcipCanvas: string | null,
  changeLogic: string | null,
  changeStrategy: string | null
): Promise<string> {
  const projectContext = [
    bcipCanvas ? `BCIP Canvas:\n${bcipCanvas}` : null,
    changeLogic ? `Change Logic:\n${changeLogic}` : null,
    changeStrategy ? `Change Strategy:\n${changeStrategy}` : null,
  ].filter(Boolean).join("\n\n");

  const systemPrompt = `You are a change management specialist expert in the REM16™ framework and psychological safety. Your task is to craft tailored, empathetic communication messages for stakeholders based on their mental model archetype. Messages must be psychologically safe, respectful, and actionable.`;

  const userPrompt = `Please write a tailored change management communication message for the following stakeholder:

Stakeholder Name: ${stakeholderName}
Role: ${role}
Mental Model Archetype: ${mentalModel}
Mental Model Description: ${mentalModelDescription}

Project: ${projectName}

${projectContext ? `Project Context:\n${projectContext}\n` : ""}

Requirements:
- Address the stakeholder by name
- Acknowledge their specific thinking style and change orientation (${mentalModel})
- Use language and framing that resonates with their mental model archetype
- Be psychologically safe: acknowledge concerns, validate their perspective, build trust
- Explain what the change means for them specifically
- Give clear, actionable next steps
- Keep it professional but warm
- Length: 200-350 words

Write the message now:`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
  });

  return response.choices[0]?.message?.content ?? "Unable to generate message at this time.";
}

router.post("/", async (req, res) => {
  try {
    const { surveyId, projectId } = req.body;

    if (!surveyId || !projectId) {
      res.status(400).json({ error: "surveyId and projectId are required" });
      return;
    }

    const { data: survey, error: surveyErr } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", surveyId)
      .single();

    if (surveyErr || !survey) {
      res.status(404).json({ error: "Survey not found" });
      return;
    }

    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectErr || !project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const generatedContent = await generateAIMessage(
      survey.stakeholder_name,
      survey.mental_model,
      survey.mental_model_description,
      survey.role,
      project.name,
      project.bcip_canvas ?? null,
      project.change_logic ?? null,
      project.change_strategy ?? null
    );

    const { data: message, error: insertErr } = await supabase
      .from("ai_messages")
      .insert({
        survey_id: surveyId,
        project_id: projectId,
        stakeholder_name: survey.stakeholder_name,
        mental_model: survey.mental_model,
        generated_content: generatedContent,
        edited_content: null,
        status: "draft",
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    res.status(201).json({
      id: message.id,
      surveyId: message.survey_id,
      projectId: message.project_id,
      stakeholderName: message.stakeholder_name,
      mentalModel: message.mental_model,
      generatedContent: message.generated_content,
      editedContent: message.edited_content,
      status: message.status,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
    });
  } catch (error) {
    console.error("Error generating message:", error);
    res.status(500).json({ error: "Failed to generate message" });
  }
});

router.post("/:id/send-email", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { subject } = req.body;

    if (!subject) {
      res.status(400).json({ error: "subject is required" });
      return;
    }

    const { data: message, error: msgErr } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("id", id)
      .single();

    if (msgErr || !message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    const { data: survey, error: surveyErr } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", message.survey_id)
      .single();

    if (surveyErr || !survey) {
      res.status(404).json({ error: "Survey not found" });
      return;
    }

    if (!survey.stakeholder_email || survey.stakeholder_email === "unknown@example.com") {
      res.status(400).json({ error: "Stakeholder does not have a valid email address" });
      return;
    }

    const content = message.edited_content || message.generated_content;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
        <div style="background: #0f2044; padding: 28px 32px; border-radius: 12px 12px 0 0;">
          <p style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px;">Reframe Change · REM16™ Framework</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
          <p style="white-space: pre-wrap; line-height: 1.7; font-size: 15px; color: #374151;">${content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: survey.stakeholder_email,
      subject,
      text: content,
      html: htmlContent,
    });

    await supabase
      .from("ai_messages")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", id);

    res.json({ success: true, message: `Email sent to ${survey.stakeholder_email}` });
  } catch (error: any) {
    console.error("Error sending email:", error);
    if (error.message?.includes("SENDGRID_API_KEY")) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to send email" });
    }
  }
});

export default router;
