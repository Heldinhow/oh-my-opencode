import { z } from "zod"

export const BuiltinAgentNameSchema = z.enum([
  "invoker",
  "enigma",
  "tinker",
  "oracle",
  "keeper",
  "mirana",
  "broodmother",
  "rubick",
  "clockwerk",
  "axe",
])

export const BuiltinSkillNameSchema = z.enum([
  "playwright",
  "agent-browser",
  "dev-browser",
  "frontend-ui-ux",
  "git-master",
])

export const OverridableAgentNameSchema = z.enum([
  "build",
  "plan",
  "invoker",
  "enigma",
  "invoker-junior",
  "OpenCode-Builder",
  "tinker",
  "rubick",
  "clockwerk",
  "oracle",
  "keeper",
  "mirana",
  "broodmother",
  "axe",
])

export const AgentNameSchema = BuiltinAgentNameSchema
export type AgentName = z.infer<typeof AgentNameSchema>

export type BuiltinSkillName = z.infer<typeof BuiltinSkillNameSchema>
