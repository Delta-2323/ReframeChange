import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { aiMessagesTable, surveysTable, projectsTable } from "@workspace/db";
import { GenerateMessageBody, GetMessageParams, UpdateMessageBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq } from "drizzle-orm";

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
    const body = GenerateMessageBody.parse(req.body);
    const { surveyId, projectId } = body;

    const [survey] = await db.select().from(surveysTable).where(eq(surveysTable.id, surveyId));
    if (!survey) {
      res.status(404).json({ error: "Survey not found" });
      return;
    }

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const generatedContent = await generateAIMessage(
      survey.stakeholderName,
      survey.mentalModel,
      survey.mentalModelDescription,
      survey.role,
      project.name,
      project.bcipCanvas ?? null,
      project.changeLogic ?? null,
      project.changeStrategy ?? null
    );

    const [message] = await db.insert(aiMessagesTable).values({
      surveyId,
      projectId,
      stakeholderName: survey.stakeholderName,
      mentalModel: survey.mentalModel,
      generatedContent,
      editedContent: null,
      status: "draft",
    }).returning();

    res.status(201).json(message);
  } catch (error) {
    console.error("Error generating message:", error);
    res.status(500).json({ error: "Failed to generate message" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const messages = await db.select().from(aiMessagesTable).orderBy(aiMessagesTable.createdAt);
    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetMessageParams.parse({ id: Number(req.params.id) });
    const [message] = await db.select().from(aiMessagesTable).where(eq(aiMessagesTable.id, id));
    if (!message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    res.json(message);
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ error: "Failed to fetch message" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = GetMessageParams.parse({ id: Number(req.params.id) });
    const body = UpdateMessageBody.parse(req.body);

    const [message] = await db.update(aiMessagesTable)
      .set({
        ...(body.editedContent !== undefined ? { editedContent: body.editedContent } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(aiMessagesTable.id, id))
      .returning();

    if (!message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    res.json(message);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(400).json({ error: "Invalid message data" });
  }
});

export default router;
