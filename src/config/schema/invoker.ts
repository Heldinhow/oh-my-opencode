import { z } from "zod"

export const InvokerTasksConfigSchema = z.object({
  /** Absolute or relative storage path override. When set, bypasses global config dir. */
  storage_path: z.string().optional(),
  /** Force task list ID (alternative to env ULTRAWORK_TASK_LIST_ID) */
  task_list_id: z.string().optional(),
  /** Enable Claude Code path compatibility mode */
  claude_code_compat: z.boolean().default(false),
})

export const InvokerConfigSchema = z.object({
  tasks: InvokerTasksConfigSchema.optional(),
})

export type InvokerTasksConfig = z.infer<typeof InvokerTasksConfigSchema>
export type InvokerConfig = z.infer<typeof InvokerConfigSchema>
