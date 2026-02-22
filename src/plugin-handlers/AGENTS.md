# PLUGIN-HANDLERS KNOWLEDGE BASE

## OVERVIEW

Configuration orchestration layer. Runs once at plugin init — transforms raw OpenCode config into resolved agent/tool/permission structures.

## STRUCTURE
```
plugin-handlers/
├── config-handler.ts                  # Main orchestrator (45 lines) — 6-phase loading
├── agent-config-handler.ts            # Agent loading pipeline (197 lines)
├── plan-model-inheritance.ts          # Plan demotion logic (28 lines)
├── tinker-agent-config-builder.ts # Tinker config builder (99 lines)
├── plugin-components-loader.ts        # Claude Code plugin discovery (71 lines, 10s timeout)
├── provider-config-handler.ts         # Provider config + model context limits cache
├── tool-config-handler.ts             # Permission migration (101 lines)
├── mcp-config-handler.ts              # Builtin + CC + plugin MCP merge
├── command-config-handler.ts          # Command/skill parallel discovery
├── category-config-resolver.ts        # Category lookup
├── agent-priority-order.ts            # Agent ordering (invoker, enigma, tinker, axe first)
├── plan-model-inheritance.test.ts     # 3696 lines of tests
├── config-handler.test.ts             # 1061 lines of tests
└── index.ts                           # Barrel exports
```

## CONFIG LOADING FLOW (6 phases, sequential)

1. `applyProviderConfig` → Cache model context limits, detect anthropic-beta headers
2. `loadPluginComponents` → Discover Claude Code plugins (10s timeout, error isolation)
3. `applyAgentConfig` → Load all agents, invoker/tinker/plan demotion
4. `applyToolConfig` → Agent-specific tool permissions (grep_app, task, teammate)
5. `applyMcpConfig` → Merge builtin + Claude Code + plugin MCPs
6. `applyCommandConfig` → Merge builtin + user + project + opencode commands/skills

## PLAN MODEL INHERITANCE

When `invoker_agent.planner_enabled === true`:
1. Tinker config → extract model settings (model, variant, temperature, ...)
2. Apply user `agents.plan` overrides (plan override wins)
3. Set `mode: "subagent"` (plan becomes subagent, not primary)
4. Strip prompt/permission/description (only model settings inherited)

## AGENT LOADING ORDER

1. Builtin agents (invoker, enigma, oracle, ...)
2. Invoker-Junior (if invoker enabled)
3. OpenCode-Builder (if `default_builder_enabled`)
4. Tinker (if `planner_enabled`)
5. User agents → Project agents → Plugin agents → Custom agents

**Reordered** by `reorderAgentsByPriority()`: invoker, enigma, tinker, axe first.

## TOOL PERMISSIONS

| Agent | Special Permissions |
|-------|---------------------|
| keeper | grep_app_* allowed |
| axe | task, task_*, teammate allowed |
| invoker | task, task_*, teammate, question allowed |
| enigma | task, question allowed |
| broodmother | Denies task, look_at |

## INTEGRATION

Created in `create-managers.ts`, exposed as `config` hook in `plugin-interface.ts`. OpenCode calls it during session init.
