import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const surveysTable = pgTable("surveys", {
  id: serial("id").primaryKey(),
  stakeholderName: text("stakeholder_name").notNull(),
  stakeholderEmail: text("stakeholder_email").notNull(),
  role: text("role").notNull(),
  thinkingFocus: text("thinking_focus").notNull(),
  orientation: text("orientation").notNull(),
  changeRole: text("change_role").notNull(),
  mentalModel: text("mental_model").notNull(),
  mentalModelDescription: text("mental_model_description").notNull(),
  projectId: integer("project_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSurveySchema = createInsertSchema(surveysTable).omit({ id: true, createdAt: true });
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type Survey = typeof surveysTable.$inferSelect;
