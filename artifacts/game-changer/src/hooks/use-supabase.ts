import { useQuery, useMutation } from "@tanstack/react-query";
import { surveyService, projectService, messageService, dashboardService } from "@/lib/supabase-services";

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
    mutationFn: (data: {
      name: string;
      bcipCanvas?: string;
      changeLogic?: string;
      changeStrategy?: string;
      managerName?: string;
    }) => projectService.create(data),
  });
}

export function useUpdateProject() {
  return useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: {
        name: string;
        bcipCanvas?: string;
        changeLogic?: string;
        changeStrategy?: string;
        managerName?: string;
      };
    }) => projectService.update(id, data),
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

export function useGetDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: () => dashboardService.getStats(),
  });
}
