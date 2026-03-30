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
  status: string;
  bcip_canvas: string | null;
  change_logic: string | null;
  change_strategy: string | null;
  communication_plan: string | null;
  stakeholder_impact: string | null;
  manager_name: string | null;
  document_name: string | null;
  document_mime_type: string | null;
  bcip_doc_name: string | null;
  bcip_doc_path: string | null;
  logic_doc_name: string | null;
  logic_doc_path: string | null;
  strategy_doc_name: string | null;
  strategy_doc_path: string | null;
  comm_plan_doc_name: string | null;
  comm_plan_doc_path: string | null;
  impact_doc_name: string | null;
  impact_doc_path: string | null;
  start_date: string | null;
  go_live_date: string | null;
  communication_start_date: string | null;
  assessment_end_date: string | null;
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

export type Concern = {
  id: number;
  survey_id: number | null;
  project_id: number | null;
  stakeholder_name: string;
  concern_text: string;
  assigned_to_sme_email: string | null;
  assigned_to_sme_name: string | null;
  sme_response: string | null;
  manager_response: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type DashboardStats = {
  totalSurveys: number;
  totalProjects: number;
  totalMessages: number;
  approvedMessages: number;
  totalConcerns: number;
  openConcerns: number;
  mentalModelDistribution: { mentalModel: string; count: number }[];
  focusAreaDistribution: { focusArea: string; count: number }[];
  orientationDistribution: { orientation: string; count: number }[];
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

function toCamelProject(p: Partial<Project> & { id: number; name: string; created_at: string; updated_at: string }) {
  return {
    id: p.id,
    name: p.name,
    status: p.status ?? "active",
    bcipCanvas: p.bcip_canvas ?? null,
    changeLogic: p.change_logic ?? null,
    changeStrategy: p.change_strategy ?? null,
    communicationPlan: p.communication_plan ?? null,
    stakeholderImpact: p.stakeholder_impact ?? null,
    managerName: p.manager_name ?? null,
    documentName: p.document_name ?? null,
    documentMimeType: p.document_mime_type ?? null,
    bcipDocName: p.bcip_doc_name ?? null,
    bcipDocPath: p.bcip_doc_path ?? null,
    logicDocName: p.logic_doc_name ?? null,
    logicDocPath: p.logic_doc_path ?? null,
    strategyDocName: p.strategy_doc_name ?? null,
    strategyDocPath: p.strategy_doc_path ?? null,
    commPlanDocName: p.comm_plan_doc_name ?? null,
    commPlanDocPath: p.comm_plan_doc_path ?? null,
    impactDocName: p.impact_doc_name ?? null,
    impactDocPath: p.impact_doc_path ?? null,
    startDate: p.start_date ?? null,
    goLiveDate: p.go_live_date ?? null,
    communicationStartDate: p.communication_start_date ?? null,
    assessmentEndDate: p.assessment_end_date ?? null,
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

function toCamelConcern(c: Concern) {
  return {
    id: c.id,
    surveyId: c.survey_id,
    projectId: c.project_id,
    stakeholderName: c.stakeholder_name,
    concernText: c.concern_text,
    assignedToSmeEmail: c.assigned_to_sme_email,
    assignedToSmeName: c.assigned_to_sme_name,
    smeResponse: c.sme_response,
    managerResponse: c.manager_response,
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
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

export type FieldDocKey = "bcip" | "logic" | "strategy" | "comm_plan" | "impact";

export const projectService = {
  async create(data: {
    name: string;
    bcipCanvas?: string;
    changeLogic?: string;
    changeStrategy?: string;
    communicationPlan?: string;
    stakeholderImpact?: string;
    managerName?: string;
    startDate?: string | null;
    goLiveDate?: string | null;
    communicationStartDate?: string | null;
    assessmentEndDate?: string | null;
  }) {
    const row: Record<string, unknown> = {
      name: data.name,
      bcip_canvas: data.bcipCanvas ?? null,
      change_logic: data.changeLogic ?? null,
      change_strategy: data.changeStrategy ?? null,
      manager_name: data.managerName ?? null,
    };
    if (data.communicationPlan) row.communication_plan = data.communicationPlan;
    if (data.stakeholderImpact) row.stakeholder_impact = data.stakeholderImpact;
    if (data.startDate) row.start_date = data.startDate;
    if (data.goLiveDate) row.go_live_date = data.goLiveDate;
    if (data.communicationStartDate) row.communication_start_date = data.communicationStartDate;
    if (data.assessmentEndDate) row.assessment_end_date = data.assessmentEndDate;

    const { data: project, error } = await supabase
      .from("projects")
      .insert(row)
      .select()
      .single();

    if (error) throw error;
    return toCamelProject(project);
  },

  async getAll() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { projects: (data || []).map(toCamelProject) };
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
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
    communicationPlan?: string;
    stakeholderImpact?: string;
    managerName?: string;
    startDate?: string | null;
    goLiveDate?: string | null;
    communicationStartDate?: string | null;
    assessmentEndDate?: string | null;
  }) {
    const row: Record<string, unknown> = {
      name: data.name,
      bcip_canvas: data.bcipCanvas ?? null,
      change_logic: data.changeLogic ?? null,
      change_strategy: data.changeStrategy ?? null,
      manager_name: data.managerName ?? null,
      updated_at: new Date().toISOString(),
    };
    if (data.communicationPlan !== undefined) row.communication_plan = data.communicationPlan || null;
    if (data.stakeholderImpact !== undefined) row.stakeholder_impact = data.stakeholderImpact || null;
    if (data.startDate !== undefined) row.start_date = data.startDate || null;
    if (data.goLiveDate !== undefined) row.go_live_date = data.goLiveDate || null;
    if (data.communicationStartDate !== undefined) row.communication_start_date = data.communicationStartDate || null;
    if (data.assessmentEndDate !== undefined) row.assessment_end_date = data.assessmentEndDate || null;

    const { data: project, error } = await supabase
      .from("projects")
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return toCamelProject(project);
  },

  async toggleStatus(id: number, status: "active" | "inactive") {
    try {
      const { data: project, error } = await supabase
        .from("projects")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return toCamelProject(project);
    } catch (err) {
      throw new Error(`Could not toggle status. You may need to run the migration SQL to add the 'status' column. Original: ${err instanceof Error ? err.message : err}`);
    }
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

  async uploadFieldDocument(projectId: number, field: FieldDocKey, file: File) {
    const filePath = `${projectId}/${field}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("project-documents")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const nameCol = `${field}_doc_name`;
    const pathCol = `${field}_doc_path`;

    const { data: project, error } = await supabase
      .from("projects")
      .update({
        [nameCol]: file.name,
        [pathCol]: filePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;
    return toCamelProject(project);
  },

  async downloadFieldDocument(projectId: number, field: FieldDocKey) {
    const nameCol = `${field}_doc_name`;
    const pathCol = `${field}_doc_path`;

    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) throw error;
    const rec = project as unknown as Record<string, string | null>;
    const docName = rec[nameCol];
    const docPath = rec[pathCol];

    if (!docPath || !docName) throw new Error("No document attached");

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("project-documents")
      .download(docPath);

    if (downloadError) throw downloadError;
    return { blob: fileData, name: docName };
  },

  async deleteFieldDocument(projectId: number, field: FieldDocKey) {
    const pathCol = `${field}_doc_path`;

    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    const docPath = (project as unknown as Record<string, string | null> | null)?.[pathCol];
    if (docPath) {
      await supabase.storage.from("project-documents").remove([docPath]);
    }

    const nameCol = `${field}_doc_name`;
    const { data: updated, error } = await supabase
      .from("projects")
      .update({
        [nameCol]: null,
        [pathCol]: null,
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

export const concernService = {
  async create(data: {
    surveyId?: number | null;
    projectId?: number | null;
    stakeholderName: string;
    concernText: string;
  }) {
    const { data: concern, error } = await supabase
      .from("concerns")
      .insert({
        survey_id: data.surveyId ?? null,
        project_id: data.projectId ?? null,
        stakeholder_name: data.stakeholderName,
        concern_text: data.concernText,
      })
      .select()
      .single();

    if (error) throw error;
    return toCamelConcern(concern);
  },

  async getAll() {
    const { data, error } = await supabase
      .from("concerns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { concerns: (data || []).map(toCamelConcern) };
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("concerns")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return toCamelConcern(data);
  },

  async assignToSme(id: number, smeEmail: string, smeName: string) {
    const { data: concern, error } = await supabase
      .from("concerns")
      .update({
        assigned_to_sme_email: smeEmail,
        assigned_to_sme_name: smeName,
        status: "assigned",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return toCamelConcern(concern);
  },

  async submitSmeResponse(id: number, response: string) {
    const { data: concern, error } = await supabase
      .from("concerns")
      .update({
        sme_response: response,
        status: "responded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return toCamelConcern(concern);
  },

  async submitManagerResponse(id: number, response: string) {
    const { data: concern, error } = await supabase
      .from("concerns")
      .update({
        manager_response: response,
        status: "resolved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return toCamelConcern(concern);
  },

  async resolve(id: number) {
    const { data: concern, error } = await supabase
      .from("concerns")
      .update({
        status: "resolved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return toCamelConcern(concern);
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

    let concernsCount = 0;
    let openConcernsCount = 0;
    try {
      const [concernsRes, openConcernsRes] = await Promise.all([
        supabase.from("concerns").select("*", { count: "exact", head: true }),
        supabase.from("concerns").select("*", { count: "exact", head: true }).in("status", ["open", "assigned"]),
      ]);
      concernsCount = concernsRes.count ?? 0;
      openConcernsCount = openConcernsRes.count ?? 0;
    } catch {
    }

    const { data: surveys } = await supabase.from("surveys").select("mental_model, thinking_focus, orientation");

    const modelMap: Record<string, number> = {};
    const focusMap: Record<string, number> = {};
    const orientMap: Record<string, number> = {};
    for (const s of surveys || []) {
      modelMap[s.mental_model] = (modelMap[s.mental_model] ?? 0) + 1;
      focusMap[s.thinking_focus] = (focusMap[s.thinking_focus] ?? 0) + 1;
      orientMap[s.orientation] = (orientMap[s.orientation] ?? 0) + 1;
    }

    return {
      totalSurveys: surveysRes.count ?? 0,
      totalProjects: projectsRes.count ?? 0,
      totalMessages: messagesRes.count ?? 0,
      approvedMessages: approvedRes.count ?? 0,
      totalConcerns: concernsCount,
      openConcerns: openConcernsCount,
      mentalModelDistribution: Object.entries(modelMap)
        .map(([mentalModel, count]) => ({ mentalModel, count }))
        .sort((a, b) => b.count - a.count),
      focusAreaDistribution: Object.entries(focusMap)
        .map(([focusArea, count]) => ({ focusArea, count }))
        .sort((a, b) => b.count - a.count),
      orientationDistribution: Object.entries(orientMap)
        .map(([orientation, count]) => ({ orientation, count }))
        .sort((a, b) => b.count - a.count),
    };
  },
};
