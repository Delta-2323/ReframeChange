import { supabase } from "./supabase";
import { getMentalModel, type ThinkingFocus, type Orientation, type ChangeRole } from "./rem16";

export type Survey = {
  id: number;
  stakeholder_name: string;
  stakeholder_email: string;
  role: string;
  thinking_focus: string;
  orientation: string;
  change_role: string;
  mental_model: string;
  mental_model_description: string;
  project_id: number | null;
  created_at: string;
};

export type Project = {
  id: number;
  name: string;
  bcip_canvas: string | null;
  change_logic: string | null;
  change_strategy: string | null;
  manager_name: string | null;
  document_name: string | null;
  document_mime_type: string | null;
  created_at: string;
  updated_at: string;
};

export type AiMessage = {
  id: number;
  survey_id: number;
  project_id: number;
  stakeholder_name: string;
  mental_model: string;
  generated_content: string;
  edited_content: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type DashboardStats = {
  totalSurveys: number;
  totalProjects: number;
  totalMessages: number;
  approvedMessages: number;
  mentalModelDistribution: { mentalModel: string; count: number }[];
};

function toCamelSurvey(s: Survey) {
  return {
    id: s.id,
    stakeholderName: s.stakeholder_name,
    stakeholderEmail: s.stakeholder_email,
    role: s.role,
    thinkingFocus: s.thinking_focus,
    orientation: s.orientation,
    changeRole: s.change_role,
    mentalModel: s.mental_model,
    mentalModelDescription: s.mental_model_description,
    projectId: s.project_id,
    createdAt: s.created_at,
  };
}

function toCamelProject(p: Project) {
  return {
    id: p.id,
    name: p.name,
    bcipCanvas: p.bcip_canvas,
    changeLogic: p.change_logic,
    changeStrategy: p.change_strategy,
    managerName: p.manager_name,
    documentName: p.document_name,
    documentMimeType: p.document_mime_type,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

function toCamelMessage(m: AiMessage) {
  return {
    id: m.id,
    surveyId: m.survey_id,
    projectId: m.project_id,
    stakeholderName: m.stakeholder_name,
    mentalModel: m.mental_model,
    generatedContent: m.generated_content,
    editedContent: m.edited_content,
    status: m.status,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  };
}

export const surveyService = {
  async submit(data: {
    stakeholderName: string;
    stakeholderEmail: string;
    role: string;
    thinkingFocus: string;
    orientation: string;
    changeRole: string;
    projectId?: number | null;
  }) {
    const mentalModelData = getMentalModel(
      data.thinkingFocus as ThinkingFocus,
      data.orientation as Orientation,
      data.changeRole as ChangeRole
    );

    const { data: survey, error } = await supabase
      .from("surveys")
      .insert({
        stakeholder_name: data.stakeholderName,
        stakeholder_email: data.stakeholderEmail,
        role: data.role,
        thinking_focus: data.thinkingFocus,
        orientation: data.orientation,
        change_role: data.changeRole,
        mental_model: mentalModelData.name,
        mental_model_description: mentalModelData.description,
        project_id: data.projectId ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return toCamelSurvey(survey);
  },

  async getAll() {
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { surveys: (data || []).map(toCamelSurvey) };
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return toCamelSurvey(data);
  },
};

export const projectService = {
  async create(data: {
    name: string;
    bcipCanvas?: string;
    changeLogic?: string;
    changeStrategy?: string;
    managerName?: string;
  }) {
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        name: data.name,
        bcip_canvas: data.bcipCanvas ?? null,
        change_logic: data.changeLogic ?? null,
        change_strategy: data.changeStrategy ?? null,
        manager_name: data.managerName ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return toCamelProject(project);
  },

  async getAll() {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, bcip_canvas, change_logic, change_strategy, manager_name, document_name, document_mime_type, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { projects: (data || []).map(toCamelProject) };
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, bcip_canvas, change_logic, change_strategy, manager_name, document_name, document_mime_type, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error) throw error;
    return toCamelProject(data);
  },

  async update(id: number, data: {
    name: string;
    bcipCanvas?: string;
    changeLogic?: string;
    changeStrategy?: string;
    managerName?: string;
  }) {
    const { data: project, error } = await supabase
      .from("projects")
      .update({
        name: data.name,
        bcip_canvas: data.bcipCanvas ?? null,
        change_logic: data.changeLogic ?? null,
        change_strategy: data.changeStrategy ?? null,
        manager_name: data.managerName ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return toCamelProject(project);
  },

  async uploadDocument(projectId: number, file: File) {
    const filePath = `${projectId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("project-documents")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: project, error } = await supabase
      .from("projects")
      .update({
        document_name: file.name,
        document_mime_type: file.type,
        document_data: filePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;
    return toCamelProject(project);
  },

  async downloadDocument(projectId: number) {
    const { data: project, error } = await supabase
      .from("projects")
      .select("document_name, document_mime_type, document_data")
      .eq("id", projectId)
      .single();

    if (error) throw error;
    if (!project?.document_data || !project?.document_name) {
      throw new Error("No document attached to this project");
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("project-documents")
      .download(project.document_data);

    if (downloadError) throw downloadError;
    return {
      blob: fileData,
      name: project.document_name,
      mimeType: project.document_mime_type,
    };
  },

  async deleteDocument(projectId: number) {
    const { data: project } = await supabase
      .from("projects")
      .select("document_data")
      .eq("id", projectId)
      .single();

    if (project?.document_data) {
      await supabase.storage
        .from("project-documents")
        .remove([project.document_data]);
    }

    const { data: updated, error } = await supabase
      .from("projects")
      .update({
        document_name: null,
        document_mime_type: null,
        document_data: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;
    return toCamelProject(updated);
  },
};

export const messageService = {
  async getAll() {
    const { data, error } = await supabase
      .from("ai_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { messages: (data || []).map(toCamelMessage) };
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return toCamelMessage(data);
  },

  async update(id: number, data: { editedContent?: string; status?: string }) {
    const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.editedContent !== undefined) updateFields.edited_content = data.editedContent;
    if (data.status !== undefined) updateFields.status = data.status;

    const { data: message, error } = await supabase
      .from("ai_messages")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return toCamelMessage(message);
  },
};

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [surveysRes, projectsRes, messagesRes, approvedRes] = await Promise.all([
      supabase.from("surveys").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("ai_messages").select("*", { count: "exact", head: true }),
      supabase.from("ai_messages").select("*", { count: "exact", head: true }).eq("status", "approved"),
    ]);

    const { data: surveys } = await supabase.from("surveys").select("mental_model");

    const distributionMap: Record<string, number> = {};
    for (const s of surveys || []) {
      distributionMap[s.mental_model] = (distributionMap[s.mental_model] ?? 0) + 1;
    }

    const mentalModelDistribution = Object.entries(distributionMap)
      .map(([mentalModel, count]) => ({ mentalModel, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSurveys: surveysRes.count ?? 0,
      totalProjects: projectsRes.count ?? 0,
      totalMessages: messagesRes.count ?? 0,
      approvedMessages: approvedRes.count ?? 0,
      mentalModelDistribution,
    };
  },
};
