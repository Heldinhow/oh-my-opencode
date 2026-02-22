# AGENTS KNOWLEDGE BASE

## OVERVIEW

11 AI agents with factory functions, fallback chains, and model-specific prompt variants. Each agent has metadata (category, cost, triggers) and configurable tool restrictions.

## STRUCTURE
```
agents/
├── invoker.ts                 # Main orchestrator (530 lines)
├── enigma.ts               # Autonomous deep worker (624 lines)
├── oracle.ts                   # Strategic advisor (170 lines)
├── keeper.ts                # Multi-repo research (328 lines)
├── mirana.ts                  # Fast codebase grep (124 lines)
├── broodmother.ts        # Media analyzer (58 lines)
├── rubick.ts                    # Pre-planning analysis (347 lines)
├── clockwerk.ts                    # Plan validator (244 lines)
├── axe/                      # Master orchestrator
│   ├── agent.ts                # Axe factory
│   ├── default.ts              # Claude-optimized prompt
│   ├── gpt.ts                  # GPT-optimized prompt
│   └── utils.ts
├── tinker/                 # Planning agent
│   ├── index.ts
│   ├── system-prompt.ts        # 6-section prompt assembly
│   ├── plan-template.ts        # Work plan structure (423 lines)
│   ├── interview-mode.ts       # Interview flow (335 lines)
│   ├── plan-generation.ts
│   ├── high-accuracy-mode.ts
│   ├── identity-constraints.ts # Identity rules (301 lines)
│   └── behavioral-summary.ts
├── invoker-junior/            # Delegated task executor
│   ├── agent.ts
│   ├── default.ts              # Claude prompt
│   └── gpt.ts                  # GPT prompt
├── dynamic-agent-prompt-builder.ts  # Dynamic prompt generation (431 lines)
├── builtin-agents/             # Agent registry (8 files)
├── utils.ts                    # Agent creation, model fallback resolution (571 lines)
├── types.ts                    # AgentModelConfig, AgentPromptMetadata
└── index.ts                    # Exports
```

## AGENT MODELS

| Agent | Model | Temp | Fallback Chain | Cost |
|-------|-------|------|----------------|------|
| Invoker | glm-5-free | 0.1 | NONE | FREE |
| Enigma | glm-5-free | 0.1 | NONE | FREE |
| Axe | glm-5-free | 0.1 | NONE | FREE |
| Tinker | glm-5-free | 0.1 | NONE | FREE |
| oracle | glm-5-free | 0.1 | NONE | FREE |
| keeper | glm-5-free | 0.1 | NONE | FREE |
| mirana | glm-5-free | 0.1 | NONE | FREE |
| broodmother | glm-5-free | 0.1 | NONE | FREE |
| Rubick | glm-5-free | 0.3 | NONE | FREE |
| Clockwerk | glm-5-free | 0.1 | NONE | FREE |
| Invoker-Junior | glm-5-free | 0.1 | NONE | FREE |

## TOOL RESTRICTIONS

| Agent | Denied | Allowed |
|-------|--------|---------|
| oracle | write, edit, task, call_omo_agent | Read-only consultation |
| keeper | write, edit, task, call_omo_agent | Research tools only |
| mirana | write, edit, task, call_omo_agent | Search tools only |
| broodmother | ALL except `read` | Vision-only |
| Invoker-Junior | task | No delegation |
| Axe | task, call_omo_agent | Orchestration only |

## THINKING / REASONING

| Agent | Claude | GPT |
|-------|--------|-----|
| Invoker | 32k budget tokens | reasoningEffort: "medium" |
| Enigma | — | reasoningEffort: "medium" |
| Oracle | 32k budget tokens | reasoningEffort: "medium" |
| Rubick | 32k budget tokens | — |
| Clockwerk | 32k budget tokens | reasoningEffort: "medium" |
| Invoker-Junior | 32k budget tokens | reasoningEffort: "medium" |

## HOW TO ADD

1. Create `src/agents/my-agent.ts` exporting factory + metadata
2. Add to `agentSources` in `src/agents/builtin-agents/`
3. Update `AgentNameSchema` in `src/config/schema/agent-names.ts`
4. Register in `src/plugin-handlers/agent-config-handler.ts`

## KEY PATTERNS

- **Factory**: `createXXXAgent(model): AgentConfig`
- **Metadata**: `XXX_PROMPT_METADATA` with category, cost, triggers
- **Model-specific prompts**: Axe, Invoker-Junior have GPT vs Claude variants
- **Dynamic prompts**: Invoker, Enigma use `dynamic-agent-prompt-builder.ts` to inject available tools/skills/categories

## ANTI-PATTERNS

- **Trust agent self-reports**: NEVER — always verify outputs
- **High temperature**: Don't use >0.3 for code agents
- **Sequential calls**: Use `task` with `run_in_background` for exploration
- **Tinker writing code**: Planner only — never implements
