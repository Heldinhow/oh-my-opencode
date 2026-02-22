import type { PluginInput } from "@opencode-ai/plugin"
import type { OhMyOpenCodeConfig } from "../../config"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { log } from "../../shared/logger"
import { readBoulderState } from "../../features/boulder-state"

const HOOK_NAME = "sdd-gate" as const
const SPECS_DIR = ".sisyphus/specs"
const SDD_STATE_FILE = "sdd-state.json"

interface SddState {
  spec_status?: string
  [key: string]: unknown
}

interface ChatMessageInput {
  sessionID: string
  messageID?: string
}

interface ChatMessageOutput {
  parts: Array<{ type: string; text?: string }>
}

function extractExplicitPlanName(promptText: string): string | null {
  const match = promptText.match(/\/start-work\s+([^\s<>]+)/i)
  return match ? match[1].trim() : null
}

function getPlanName(promptText: string, directory: string): string | null {
  const explicitName = extractExplicitPlanName(promptText)
  if (explicitName) {
    return explicitName
  }

  const boulderState = readBoulderState(directory)
  return boulderState?.plan_name ?? null
}

function isSddEnabled(config: { sisyphus_agent?: { sdd_enabled?: boolean } }): boolean {
  return config.sisyphus_agent?.sdd_enabled ?? false
}

function readSddState(planName: string, directory: string): SddState | null {
  const sddStatePath = join(directory, SPECS_DIR, planName, SDD_STATE_FILE)

  if (!existsSync(sddStatePath)) {
    return null
  }

  try {
    const content = readFileSync(sddStatePath, "utf-8")
    return JSON.parse(content) as SddState
  } catch {
    return null
  }
}

function isStartWorkCommand(promptText: string): boolean {
  return promptText.includes("/start-work")
}

export function createSddGateHook(ctx: PluginInput, pluginConfig: OhMyOpenCodeConfig) {
  return {
    "chat.message": async (
      input: ChatMessageInput,
      output: ChatMessageOutput
    ): Promise<void> => {
      const parts = output.parts
      const promptText = parts
        ?.filter((p) => p.type === "text" && p.text)
        .map((p) => p.text)
        .join("\n")
        .trim() || ""

      if (!isStartWorkCommand(promptText)) {
        return
      }

      if (!isSddEnabled(pluginConfig)) {
        log(`[${HOOK_NAME}] SDD disabled, allowing start-work`, {
          sessionID: input.sessionID,
        })
        return
      }

      log(`[${HOOK_NAME}] SDD enabled, checking spec status`, {
        sessionID: input.sessionID,
      })

      const planName = getPlanName(promptText, ctx.directory)

      if (!planName) {
        log(`[${HOOK_NAME}] No plan found, allowing (retrocompatible)`, {
          sessionID: input.sessionID,
        })
        return
      }

      const sddState = readSddState(planName, ctx.directory)

      if (!sddState) {
        log(`[${HOOK_NAME}] No sdd-state.json found for plan "${planName}", allowing (retrocompatible)`, {
          sessionID: input.sessionID,
        })
        return
      }

      const specStatus = sddState.spec_status

      if (specStatus !== "approved") {
        log(`[${HOOK_NAME}] Blocking start-work: spec_status="${specStatus}"`, {
          sessionID: input.sessionID,
          planName,
          specStatus,
        })
        throw new Error(
          `[${HOOK_NAME}] Cannot start work: SDD spec for plan "${planName}" has not been approved. ` +
          `Current status: "${specStatus ?? "unknown"}". ` +
          `Please approve the specification before starting work.`
        )
      }

      log(`[${HOOK_NAME}] Spec approved, allowing start-work`, {
        sessionID: input.sessionID,
        planName,
      })
    },
  }
}
