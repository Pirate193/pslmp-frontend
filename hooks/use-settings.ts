import { settingsapi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── API Keys ───

export const useApiKeys = () => {
  return useQuery({
    queryKey: queryKeys.settings.keys,
    queryFn: () => settingsapi.getKeys(),
  });
};

export const useSaveApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, key }: { provider: string; key: string }) =>
      settingsapi.saveKey(provider, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.keys });
    },
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) => settingsapi.deleteKey(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.keys });
    },
  });
};

export const useValidateApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) => settingsapi.validateKey(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.keys });
    },
  });
};

// ─── User Settings ───

export const useUserSettings = () => {
  return useQuery({
    queryKey: queryKeys.settings.userSettings,
    queryFn: () => settingsapi.getSettings(),
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { systemPrompt?: string | null }) =>
      settingsapi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.userSettings });
    },
  });
};
