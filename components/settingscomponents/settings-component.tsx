"use client";

import { useState } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { Settings, Key, MessageSquare, Eye, EyeOff, Check, X, Loader2, Trash2, RotateCcw, GlobeIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PROVIDERS, TAVILY_PROVIDER } from "@/lib/providers";
import { useApiKeys, useSaveApiKey, useDeleteApiKey, useValidateApiKey, useUserSettings, useUpdateUserSettings } from "@/hooks/use-settings";
import { ApiKeyInfo } from "@/lib/api-types";

// ─── Provider Key Card ───
function ProviderKeyCard({
  providerId,
  providerName,
  description,
  placeholder,
  icon,
  existingKey,
}: {
  providerId: string;
  providerName: string;
  description: string;
  placeholder: string;
  icon?: string;
  existingKey?: ApiKeyInfo;
}) {
  const [keyValue, setKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);

  const { mutateAsync: saveKey, isPending: isSaving } = useSaveApiKey();
  const { mutateAsync: deleteKey, isPending: isDeleting } = useDeleteApiKey();
  const { mutateAsync: validateKey, isPending: isValidating } = useValidateApiKey();

  const handleSave = async () => {
    if (!keyValue.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    try {
      await saveKey({ provider: providerId, key: keyValue.trim() });
      toast.success(`${providerName} key saved`);
      setKeyValue("");
      setShowKey(false);
    } catch {
      toast.error(`Failed to save ${providerName} key`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteKey(providerId);
      toast.success(`${providerName} key removed`);
    } catch {
      toast.error(`Failed to remove ${providerName} key`);
    }
  };

  const handleValidate = async () => {
    try {
      const result = await validateKey(providerId);
      if (result.valid) {
        toast.success(`${providerName} key is valid ✓`);
      } else {
        toast.error(result.error || `${providerName} key is invalid`);
      }
    } catch {
      toast.error(`Failed to validate ${providerName} key`);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon && (
            <img src={icon} alt={providerName} className="h-6 w-6" />
          )}
          <div>
            <h4 className="text-sm font-semibold text-foreground">{providerName}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {existingKey && (
          <div className="flex items-center gap-1.5">
            {existingKey.isValid ? (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <Check className="h-3 w-3" /> Valid
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-500">
                <X className="h-3 w-3" /> Invalid
              </span>
            )}
          </div>
        )}
      </div>

      {existingKey ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <Key className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-mono flex-1">
              {existingKey.displayHint}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleValidate}
                disabled={isValidating}
                className="h-7 px-2 text-xs cursor-pointer"
              >
                {isValidating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Test"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-7 px-2 text-xs text-destructive hover:text-destructive cursor-pointer"
              >
                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* Replace key */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                placeholder={`Replace with new ${placeholder}`}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                className="pr-8 text-sm h-8"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !keyValue.trim()}
              className="h-8 cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Update"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? "text" : "password"}
              placeholder={placeholder}
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              className="pr-8 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || !keyValue.trim()}
            className="cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── System Prompt Section ───
function SystemPromptSection() {
  const { data: settings, isLoading } = useUserSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateUserSettings();
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize prompt from settings
  const currentPrompt = prompt ?? settings?.systemPrompt ?? "";
  const defaultPrompt = settings?.defaultSystemPrompt ?? "";
  const isCustom = currentPrompt !== "" && currentPrompt !== defaultPrompt;

  const handleSave = async () => {
    try {
      await updateSettings({ systemPrompt: currentPrompt || null });
      toast.success("System prompt saved");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save system prompt");
    }
  };

  const handleReset = async () => {
    try {
      await updateSettings({ systemPrompt: null });
      setPrompt(null);
      toast.success("System prompt reset to default");
      setIsEditing(false);
    } catch {
      toast.error("Failed to reset system prompt");
    }
  };

  if (isLoading) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> System Prompt
          </h4>
          <p className="text-xs text-muted-foreground">
            {isCustom ? "Using custom prompt" : "Using default prompt"} · Customize how the AI responds
          </p>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPrompt(currentPrompt || defaultPrompt);
              setIsEditing(true);
            }}
            className="cursor-pointer"
          >
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={prompt ?? ""}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter your custom system prompt..."
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {(prompt ?? "").length} characters
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPrompt(null);
                  setIsEditing(false);
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isPending}
                className="cursor-pointer"
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">
            {currentPrompt || defaultPrompt}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Settings Component ───
export default function SettingsComponent() {
  const { data: apiKeys, isLoading } = useApiKeys();

  const getKeyForProvider = (providerId: string): ApiKeyInfo | undefined => {
    return apiKeys?.find((k) => k.provider === providerId);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <div className="p-4 pb-20 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <SidebarTrigger className="cursor-pointer" />
          <Settings className="h-4 w-4 text-foreground" />
          <p className="text-foreground font-medium">Settings</p>
        </div>

        {/* API Keys Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Add your API keys to use AI models from different providers. Keys are encrypted and stored securely.
          </p>

          <div className="space-y-3">
            {PROVIDERS.map((provider) => (
              <ProviderKeyCard
                key={provider.id}
                providerId={provider.id}
                providerName={provider.name}
                description={provider.description}
                placeholder={provider.placeholder}
                icon={provider.icon}
                existingKey={getKeyForProvider(provider.id)}
              />
            ))}

            <Separator className="my-4" />

            {/* Tavily (Web Search) */}
            <div className="flex items-center gap-2 mb-2">
              <GlobeIcon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Web Search</h3>
            </div>
            <ProviderKeyCard
              providerId={TAVILY_PROVIDER.id}
              providerName={TAVILY_PROVIDER.name}
              description={TAVILY_PROVIDER.description}
              placeholder={TAVILY_PROVIDER.placeholder}
              existingKey={getKeyForProvider(TAVILY_PROVIDER.id)}
            />
          </div>
        </div>

        <Separator className="mb-8" />

        {/* System Prompt Section */}
        <div className="mb-8">
          <SystemPromptSection />
        </div>
      </div>
    </div>
  );
}
