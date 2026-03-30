const API_BASE = "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export type DashboardStats = {
  totalSurveys: number;
  totalProjects: number;
  totalMessages: number;
  approvedMessages: number;
  totalConcerns: number;
  openConcerns: number;
  mentalModelDistribution: { mentalModel: string; count: number }[];
  focusAreaDistribution: { area: string; count: number }[];
  orientationDistribution: { orientation: string; count: number }[];
};

export type FieldDocKey = "bcip" | "logic" | "strategy" | "comm_plan" | "impact";

type CamelProject = {
  id: number;
  name: string;
  status: string;
  bcipCanvas: string | null;
  changeLogic: string | null;
  changeStrategy: string | null;
  communicationPlan: string | null;
  stakeholderImpact: string | null;
  managerName: string | null;
  documentName: string | null;
  documentMimeType: string | null;
  bcipDocName: string | null;
  bcipDocPath: string | null;
  logicDocName: string | null;
  logicDocPath: string | null;
  strategyDocName: string | null;
  strategyDocPath: string | null;
  commPlanDocName: string | null;
  commPlanDocPath: string | null;
  impactDocName: string | null;
  impactDocPath: string | null;
  startDate: string | null;
  goLiveDate: string | null;
  communicationStartDate: string | null;
  assessmentEndDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type CamelSurvey = {
  id: number;
  stakeholderName: string;
  stakeholderEmail: string;
  role: string;
  thinkingFocus: string;
  orientation: string;
  changeRole: string;
  mentalModel: string;
  mentalModelDescription: string;
  projectId: number | null;
  createdAt: string;
};

type CamelMessage = {
  id: number;
  surveyId: number;
  projectId: number;
  stakeholderName: string;
  mentalModel: string;
  generatedContent: string;
  editedContent: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type CamelConcern = {
  id: number;
  surveyId: number | null;
  projectId: number | null;
  stakeholderName: string;
  concernText: string;
  assignedToSmeEmail: string | null;
  assignedToSmeName: string | null;
  smeResponse: string | null;
  managerResponse: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export const surveyService = {
  async submit(data: {
    stakeholderName: string;
    stakeholderEmail: string;
    role: string;
    thinkingFocus: string;
    orientation: string;
    changeRole: string;
    projectId?: number | null;
  }): Promise<CamelSurvey> {
    return apiFetch<CamelSurvey>("/surveys", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<{ surveys: CamelSurvey[] }> {
    return apiFetch<{ surveys: CamelSurvey[] }>("/surveys");
  },

  async getById(id: number): Promise<CamelSurvey> {
    return apiFetch<CamelSurvey>(`/surveys/${id}`);
  },
};

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
  }): Promise<CamelProject> {
    return apiFetch<CamelProject>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<{ projects: CamelProject[] }> {
    return apiFetch<{ projects: CamelProject[] }>("/projects");
  },

  async getById(id: number): Promise<CamelProject> {
    return apiFetch<CamelProject>(`/projects/${id}`);
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
  }): Promise<CamelProject> {
    return apiFetch<CamelProject>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async toggleStatus(id: number, status: "active" | "inactive"): Promise<CamelProject> {
    return apiFetch<CamelProject>(`/projects/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async uploadDocument(projectId: number, file: File): Promise<CamelProject> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/projects/${projectId}/document`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Upload failed: ${res.status}`);
    }
    return res.json();
  },

  async downloadDocument(projectId: number): Promise<{ blob: Blob; name: string; mimeType: string | null }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/document`);
    if (!res.ok) throw new Error("No document attached");
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const name = match ? decodeURIComponent(match[1]) : "document";
    const blob = await res.blob();
    return { blob, name, mimeType: res.headers.get("Content-Type") };
  },

  async deleteDocument(projectId: number): Promise<CamelProject> {
    return apiFetch<CamelProject>(`/projects/${projectId}/document`, {
      method: "DELETE",
    });
  },

  async uploadFieldDocument(projectId: number, field: FieldDocKey, file: File): Promise<CamelProject> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("field", field);
    const res = await fetch(`${API_BASE}/projects/${projectId}/field-document`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Upload failed: ${res.status}`);
    }
    return res.json();
  },

  async downloadFieldDocument(projectId: number, field: FieldDocKey): Promise<{ blob: Blob; name: string }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/field-document/${field}`);
    if (!res.ok) throw new Error("No document attached");
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const name = match ? decodeURIComponent(match[1]) : "document";
    const blob = await res.blob();
    return { blob, name };
  },

  async deleteFieldDocument(projectId: number, field: FieldDocKey): Promise<void> {
    await apiFetch(`/projects/${projectId}/field-document/${field}`, {
      method: "DELETE",
    });
  },
};

export const messageService = {
  async getAll(): Promise<{ messages: CamelMessage[] }> {
    return apiFetch<{ messages: CamelMessage[] }>("/messages");
  },

  async getById(id: number): Promise<CamelMessage> {
    return apiFetch<CamelMessage>(`/messages/${id}`);
  },

  async update(id: number, data: { editedContent?: string; status?: string }): Promise<CamelMessage> {
    return apiFetch<CamelMessage>(`/messages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

export const concernService = {
  async create(data: {
    surveyId?: number | null;
    projectId?: number | null;
    stakeholderName: string;
    concernText: string;
  }): Promise<CamelConcern> {
    return apiFetch<CamelConcern>("/concerns", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<{ concerns: CamelConcern[] }> {
    return apiFetch<{ concerns: CamelConcern[] }>("/concerns");
  },

  async getById(id: number): Promise<CamelConcern> {
    return apiFetch<CamelConcern>(`/concerns/${id}`);
  },

  async assignToSme(id: number, smeEmail: string, smeName: string): Promise<CamelConcern> {
    return apiFetch<CamelConcern>(`/concerns/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ smeEmail, smeName }),
    });
  },

  async submitSmeResponse(id: number, response: string): Promise<CamelConcern> {
    return apiFetch<CamelConcern>(`/concerns/${id}/sme-response`, {
      method: "PATCH",
      body: JSON.stringify({ smeResponse: response }),
    });
  },

  async submitManagerResponse(id: number, response: string): Promise<CamelConcern> {
    return apiFetch<CamelConcern>(`/concerns/${id}/manager-response`, {
      method: "PATCH",
      body: JSON.stringify({ managerResponse: response }),
    });
  },

  async resolve(id: number): Promise<CamelConcern> {
    return apiFetch<CamelConcern>(`/concerns/${id}/resolve`, {
      method: "PATCH",
    });
  },
};

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiFetch<DashboardStats>("/dashboard/stats");
  },
};
