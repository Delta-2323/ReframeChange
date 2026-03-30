import { useQuery, useMutation } from "@tanstack/react-query";
import { surveyService, projectService, messageService, dashboardService, concernService } from "@/lib/supabase-services";

export const surveyKeys = {
  all: ["surveys"] as const,
  detail: (id: number) => ["surveys", id] as const,
};

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: number) => ["projects", id] as const,
};

export const messageKeys = {
  all: ["messages"] as const,
  detail: (id: number) => ["messages", id] as const,
};

export const concernKeys = {
  all: ["concerns"] as const,
  detail: (id: number) => ["concerns", id] as const,
};

export const dashboardKeys = {
  stats: ["dashboard", "stats"] as const,
};

export function useGetSurveys() {
  return useQuery({
    queryKey: surveyKeys.all,
    queryFn: () => surveyService.getAll(),
  });
}

export function useGetSurvey(id: number) {
  return useQuery({
    queryKey: surveyKeys.detail(id),
    queryFn: () => surveyService.getById(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useSubmitSurvey() {
  return useMutation({
    mutationFn: (data: {
      stakeholderName: string;
      stakeholderEmail: string;
      role: string;
      thinkingFocus: string;
      orientation: string;
      changeRole: string;
      projectId?: number | null;
    }) => surveyService.submit(data),
  });
}

export function useGetProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => projectService.getAll(),
  });
}

export function useGetProject(id: number) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  return useMutation({
    mutationFn: (data: Parameters<typeof projectService.create>[0]) => projectService.create(data),
  });
}

export function useUpdateProject() {
  return useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: Parameters<typeof projectService.update>[1];
    }) => projectService.update(id, data),
  });
}

export function useToggleProjectStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: "active" | "inactive" }) =>
      projectService.toggleStatus(id, status),
  });
}

export function useGetMessages() {
  return useQuery({
    queryKey: messageKeys.all,
    queryFn: () => messageService.getAll(),
  });
}

export function useGetMessage(id: number) {
  return useQuery({
    queryKey: messageKeys.detail(id),
    queryFn: () => messageService.getById(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useUpdateMessage() {
  return useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: { editedContent?: string; status?: string };
    }) => messageService.update(id, data),
  });
}

export function useGetConcerns() {
  return useQuery({
    queryKey: concernKeys.all,
    queryFn: () => concernService.getAll(),
  });
}

export function useGetConcern(id: number) {
  return useQuery({
    queryKey: concernKeys.detail(id),
    queryFn: () => concernService.getById(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateConcern() {
  return useMutation({
    mutationFn: (data: Parameters<typeof concernService.create>[0]) => concernService.create(data),
  });
}

export function useAssignConcernToSme() {
  return useMutation({
    mutationFn: ({ id, smeEmail, smeName }: { id: number; smeEmail: string; smeName: string }) =>
      concernService.assignToSme(id, smeEmail, smeName),
  });
}

export function useSubmitSmeResponse() {
  return useMutation({
    mutationFn: ({ id, response }: { id: number; response: string }) =>
      concernService.submitSmeResponse(id, response),
  });
}

export function useSubmitManagerResponse() {
  return useMutation({
    mutationFn: ({ id, response }: { id: number; response: string }) =>
      concernService.submitManagerResponse(id, response),
  });
}

export function useResolveConcern() {
  return useMutation({
    mutationFn: (id: number) => concernService.resolve(id),
  });
}

export function useGetDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: () => dashboardService.getStats(),
  });
}
