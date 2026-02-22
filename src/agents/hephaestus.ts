import type { AgentConfig } from "@opencode-ai/sdk";
import type { AgentMode } from "./types";
import type {
  AvailableAgent,
  AvailableTool,
  AvailableSkill,
  AvailableCategory,
} from "./dynamic-agent-prompt-builder";
import {
  buildKeyTriggersSection,
  buildToolSelectionTable,
  buildExploreSection,
  buildLibrarianSection,
  buildCategorySkillsDelegationGuide,
  buildDelegationTable,
  buildOracleSection,
  buildHardBlocksSection,
  buildAntiPatternsSection,
  categorizeTools,
} from "./dynamic-agent-prompt-builder";

const MODE: AgentMode = "primary";

function buildTodoDisciplineSection(useTaskSystem: boolean): string {
  if (useTaskSystem) {
    return `## Task Discipline (NON-NEGOTIABLE)

Default: track all multi-step work with tasks.

Workflow:
1. On start: TaskCreate with atomic steps (only if user wants implementation)
2. Before each step: TaskUpdate in_progress (one at a time)
3. After each step: TaskUpdate completed immediately (no batching)
4. If scope changes: update tasks first
`;
  }

  return `## Todo Discipline (NON-NEGOTIABLE)

Default: track all multi-step work with todos.

Workflow:
1. On start: todowrite with atomic steps (only if user wants implementation)
2. Before each step: mark in_progress (one at a time)
3. After each step: mark completed immediately (no batching)
4. If scope changes: update todos first
`;
}

/**
 * Hephaestus - The Autonomous Deep Worker
 */

function buildHephaestusPrompt(
  availableAgents: AvailableAgent[] = [],
  availableTools: AvailableTool[] = [],
  availableSkills: AvailableSkill[] = [],
  availableCategories: AvailableCategory[] = [],
  useTaskSystem = false,
): string {
  const keyTriggers = buildKeyTriggersSection(availableAgents, availableSkills);
  const toolSelection = buildToolSelectionTable(
    availableAgents,
    availableTools,
    availableSkills,
  );
  const exploreSection = buildExploreSection(availableAgents);
  const librarianSection = buildLibrarianSection(availableAgents);
  const categorySkillsGuide = buildCategorySkillsDelegationGuide(
    availableCategories,
    availableSkills,
  );
  const delegationTable = buildDelegationTable(availableAgents);
  const oracleSection = buildOracleSection(availableAgents);
  const hardBlocks = buildHardBlocksSection();
  const antiPatterns = buildAntiPatternsSection();
  const todoDiscipline = buildTodoDisciplineSection(useTaskSystem);

  return `You are Hephaestus, an autonomous deep worker for software engineering.

## Core Principle
Keep going. Solve problems. Ask only when truly impossible.

## Hard Constraints
${hardBlocks}

${antiPatterns}

## Completion Criteria
Task is complete only when:
- Requested functionality implemented
- lsp_diagnostics clean on modified files
- Build/test pass or pre-existing failures noted
- No temporary/debug code
- Code matches existing patterns

## Phase 0 - Intent Gate (EVERY task)
${keyTriggers}

### Classify Task Type
- Trivial: direct tools
- Explicit: execute directly
- Exploratory: explore/librarian + tools in parallel
- Open-ended: full execution loop
- Ambiguous: explore first, ask last resort

### Ambiguity Handling (EXPLORE FIRST)
- Try tools and code search before asking
- If multiple plausible intents, cover the likely ones and note assumptions
- Ask one precise question only if you cannot proceed

### Delegation Check
1. Load relevant skills immediately
2. Use specialized agent or task category + skills when appropriate
3. Only work directly when trivial

## Exploration and Research
${toolSelection}

${exploreSection}

${librarianSection}

Rules:
- explore/librarian run in background
- Collect via background_output when needed
- Stop when you have enough context

## Execution
${todoDiscipline}

${categorySkillsGuide}

${delegationTable}

Guidance:
- Delegate when specialized agents fit
- If you work directly, use tools and verify thoroughly
- Note assumptions in final message

## Verification
- lsp_diagnostics on changed files
- Run build/test when applicable
- Read every changed file

${oracleSection}
`;
}

export function createHephaestusAgent(
  model: string,
  availableAgents?: AvailableAgent[],
  availableToolNames?: string[],
  availableSkills?: AvailableSkill[],
  availableCategories?: AvailableCategory[],
  useTaskSystem = false,
): AgentConfig {
  const tools = availableToolNames ? categorizeTools(availableToolNames) : [];
  const skills = availableSkills ?? [];
  const categories = availableCategories ?? [];
  const prompt = buildHephaestusPrompt(
    availableAgents ?? [],
    tools,
    skills,
    categories,
    useTaskSystem,
  );

  return {
    description:
      "Autonomous deep worker. Solves problems end-to-end with exploration-first behavior and rigorous verification. (Hephaestus - OhMyOpenCode)",
    mode: MODE,
    model,
    maxTokens: 64000,
    prompt,
    color: "#FF4500",
    permission: {
      question: "allow",
      call_omo_agent: "deny",
    },
  } as AgentConfig;
}
createHephaestusAgent.mode = MODE;
