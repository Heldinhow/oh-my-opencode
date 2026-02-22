import { z } from "zod"

export const SisyphusAgentConfigSchema = z.object({
  disabled: z.boolean().optional(),
  default_builder_enabled: z.boolean().optional(),
  planner_enabled: z.boolean().optional(),
  replace_plan: z.boolean().optional(),
  sdd_enabled: z.boolean().default(true),
  sdd_require_approval: z.boolean().default(true),
})


export type SisyphusAgentConfig = z.infer<typeof SisyphusAgentConfigSchema>
