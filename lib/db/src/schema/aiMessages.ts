import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiMessagesTable = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull(),
  projectId: integer("project_id").notNull(),
  stakeholderName: text("stakeholder_name").notNull(),
  mentalModel: text("mental_model").notNull(),
  generatedContent: text("generated_content").notNull(),
  editedContent: text("edited_content"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiMessageSchema = createInsertSchema(aiMessagesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type AiMessage = typeof aiMessagesTable.$inferSelect;
