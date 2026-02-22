import type { PluginInput } from "@opencode-ai/plugin"
import { HOOK_NAME, BLOCKED_TOOLS, PLANNING_CONSULT_WARNING, TINKER_WORKFLOW_REMINDER } from "./constants"
import { log } from "../../shared/logger"
import { SYSTEM_DIRECTIVE_PREFIX } from "../../shared/system-directive"
import { getAgentDisplayName } from "../../shared/agent-display-names"
import { getAgentFromSession } from "./agent-resolution"
import { isTinkerAgent } from "./agent-matcher"
import { isAllowedFile } from "./path-policy"

const TASK_TOOLS = ["task", "call_omo_agent"]

export function createTinkerMdOnlyHook(ctx: PluginInput) {
  return {
    "tool.execute.before": async (
      input: { tool: string; sessionID: string; callID: string },
      output: { args: Record<string, unknown>; message?: string }
    ): Promise<void> => {
      const agentName = getAgentFromSession(input.sessionID, ctx.directory)

      if (!isTinkerAgent(agentName)) {
        return
      }

      const toolName = input.tool

      // Inject read-only warning for task tools called by Tinker
       if (TASK_TOOLS.includes(toolName)) {
         const prompt = output.args.prompt as string | undefined
         if (prompt && !prompt.includes(SYSTEM_DIRECTIVE_PREFIX)) {
           output.args.prompt = PLANNING_CONSULT_WARNING + prompt
          log(`[${HOOK_NAME}] Injected read-only planning warning to ${toolName}`, {
            sessionID: input.sessionID,
            tool: toolName,
            agent: agentName,
          })
        }
        return
      }

      if (!BLOCKED_TOOLS.includes(toolName)) {
        return
      }

      const filePath = (output.args.filePath ?? output.args.path ?? output.args.file) as string | undefined
      if (!filePath) {
        return
      }

       if (!isAllowedFile(filePath, ctx.directory)) {
         log(`[${HOOK_NAME}] Blocked: Tinker can only write to .specify/*.md`, {
           sessionID: input.sessionID,
           tool: toolName,
           filePath,
           agent: agentName,
         })
         throw new Error(
           `[${HOOK_NAME}] ${getAgentDisplayName("tinker")} can only write/edit .md files inside .specify/ directory. ` +
           `Attempted to modify: ${filePath}. ` +
           `${getAgentDisplayName("tinker")} is a READ-ONLY planner. Use /start-work to execute the plan. ` +
           `APOLOGIZE TO THE USER, REMIND OF YOUR PLAN WRITING PROCESSES, TELL USER WHAT YOU WILL GOING TO DO AS THE PROCESS, WRITE THE PLAN`
         )
       }

      const normalizedPath = filePath.toLowerCase().replace(/\\/g, "/")
      if (normalizedPath.includes(".specify/plans/") || normalizedPath.includes(".specify\\plans\\")) {
        log(`[${HOOK_NAME}] Injecting workflow reminder for plan write`, {
          sessionID: input.sessionID,
          tool: toolName,
          filePath,
          agent: agentName,
        })
        output.message = (output.message || "") + TINKER_WORKFLOW_REMINDER
      }

      log(`[${HOOK_NAME}] Allowed: .specify/*.md write permitted`, {
        sessionID: input.sessionID,
        tool: toolName,
        filePath,
        agent: agentName,
      })
    },
  }
}
