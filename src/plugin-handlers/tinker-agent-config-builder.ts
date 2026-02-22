import type { CategoryConfig } from "../config/schema";
import { PROMETHEUS_PERMISSION, buildTinkerSystemPrompt } from "../agents/tinker";
import { resolvePromptAppend } from "../agents/builtin-agents/resolve-file-uri";
import { AGENT_MODEL_REQUIREMENTS } from "../shared/model-requirements";
import {
  fetchAvailableModels,
  readConnectedProvidersCache,
  resolveModelPipeline,
} from "../shared";
import { resolveCategoryConfig } from "./category-config-resolver";

type TinkerOverride = Record<string, unknown> & {
  category?: string;
  model?: string;
  variant?: string;
  reasoningEffort?: string;
  textVerbosity?: string;
  thinking?: { type: string; budgetTokens?: number };
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
  prompt_append?: string;
};

export async function buildTinkerAgentConfig(params: {
  configAgentPlan: Record<string, unknown> | undefined;
  pluginTinkerOverride: TinkerOverride | undefined;
  userCategories: Record<string, CategoryConfig> | undefined;
  currentModel: string | undefined;
}): Promise<Record<string, unknown>> {
  const categoryConfig = params.pluginTinkerOverride?.category
    ? resolveCategoryConfig(params.pluginTinkerOverride.category, params.userCategories)
    : undefined;

  const requirement = AGENT_MODEL_REQUIREMENTS["tinker"];
  const connectedProviders = readConnectedProvidersCache();
  const availableModels = await fetchAvailableModels(undefined, {
    connectedProviders: connectedProviders ?? undefined,
  });

  const modelResolution = resolveModelPipeline({
    intent: {
      uiSelectedModel: params.currentModel,
      userModel: params.pluginTinkerOverride?.model ?? categoryConfig?.model,
    },
    constraints: { availableModels },
    policy: {
      fallbackChain: requirement?.fallbackChain,
      systemDefaultModel: undefined,
    },
  });

  const resolvedModel = modelResolution?.model;
  const resolvedVariant = modelResolution?.variant;

  const variantToUse = params.pluginTinkerOverride?.variant ?? resolvedVariant;
  const reasoningEffortToUse =
    params.pluginTinkerOverride?.reasoningEffort ?? categoryConfig?.reasoningEffort;
  const textVerbosityToUse =
    params.pluginTinkerOverride?.textVerbosity ?? categoryConfig?.textVerbosity;
  const thinkingToUse = params.pluginTinkerOverride?.thinking ?? categoryConfig?.thinking;
  const temperatureToUse =
    params.pluginTinkerOverride?.temperature ?? categoryConfig?.temperature;
  const topPToUse = params.pluginTinkerOverride?.top_p ?? categoryConfig?.top_p;
  const maxTokensToUse =
    params.pluginTinkerOverride?.maxTokens ?? categoryConfig?.maxTokens;

  const base: Record<string, unknown> = {
    name: "tinker",
    ...(resolvedModel ? { model: resolvedModel } : {}),
    ...(variantToUse ? { variant: variantToUse } : {}),
    mode: "all",
    prompt: buildTinkerSystemPrompt(),
    permission: PROMETHEUS_PERMISSION,
    description: `${(params.configAgentPlan?.description as string) ?? "Plan agent"} (Tinker - OhMyOpenCode)`,
    color: (params.configAgentPlan?.color as string) ?? "#FF5722",
    ...(temperatureToUse !== undefined ? { temperature: temperatureToUse } : {}),
    ...(topPToUse !== undefined ? { top_p: topPToUse } : {}),
    ...(maxTokensToUse !== undefined ? { maxTokens: maxTokensToUse } : {}),
    ...(categoryConfig?.tools ? { tools: categoryConfig.tools } : {}),
    ...(thinkingToUse ? { thinking: thinkingToUse } : {}),
    ...(reasoningEffortToUse !== undefined
      ? { reasoningEffort: reasoningEffortToUse }
      : {}),
    ...(textVerbosityToUse !== undefined
      ? { textVerbosity: textVerbosityToUse }
      : {}),
  };

  const override = params.pluginTinkerOverride;
  if (!override) return base;

  const { prompt_append, ...restOverride } = override;
  const merged = { ...base, ...restOverride };
  if (prompt_append && typeof merged.prompt === "string") {
    merged.prompt = merged.prompt + "\n" + resolvePromptAppend(prompt_append);
  }
  return merged;
}
