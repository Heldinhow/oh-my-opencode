/**
 * @deprecated LEGACY MIGRATION ONLY
 *
 * This map exists solely for migrating old configs that used hardcoded model strings.
 * It maps legacy model strings to semantic category names, allowing users to migrate
 * from explicit model configs to category-based configs.
 *
 * DO NOT add new entries here. New agents should use:
 * - Category-based config (preferred): { category: "unspecified-high" }
 * - Or inherit from OpenCode's config.model
 *
 * This map will be removed in a future major version once migration period ends.
 */
import { DEFAULT_CATEGORIES } from "../../tools/delegate-task/constants"
import type { CategoryConfig } from "../../config/schema"

export const MODEL_TO_CATEGORY_MAP: Record<string, string> = {
  "google/gemini-3-pro": "visual-engineering",
  "google/gemini-3-flash": "writing",
  "openai/gpt-5.2": "ultrabrain",
  "anthropic/claude-haiku-4-5": "quick",
  "anthropic/claude-opus-4-6": "unspecified-high",
  "anthropic/claude-sonnet-4-5": "unspecified-low",
}

export function migrateAgentConfigToCategory(config: Record<string, unknown>): {
  migrated: Record<string, unknown>
  changed: boolean
} {
  const { model, ...rest } = config
  if (typeof model !== "string") {
    return { migrated: config, changed: false }
  }

  const category = MODEL_TO_CATEGORY_MAP[model]
  if (!category) {
    return { migrated: config, changed: false }
  }

  return {
    migrated: { category, ...rest },
    changed: true,
  }
}

 

export function shouldDeleteAgentConfig(
  config: Record<string, unknown>,
  category: string
): boolean {
  const defaults = (DEFAULT_CATEGORIES as Record<string, CategoryConfig>)[category]
  if (!defaults) return false

  // Collect keys excluding the "category" field
  let keys = Object.keys(config).filter((k) => k !== "category")
  // If the config uses a legacy model string that maps to this category,
  // ignore that field when determining if the config should be deleted.
  const modelVal = (config as { [k: string]: unknown })["model"]
  if (typeof modelVal === "string") {
    const mapped = (MODEL_TO_CATEGORY_MAP as Record<string, string>)[modelVal]
    if (mapped === category) {
      keys = keys.filter((k) => k !== "model")
    }
  }
  if (keys.length === 0) return true

  for (const key of keys) {
    if ((config as { [k: string]: unknown })[key] !== (defaults as unknown as Record<string, unknown>)[key]) {
      return false
    }
  }
  return true
}
