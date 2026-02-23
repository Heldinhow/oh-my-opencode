import { access, mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { classifyPrefixFromContext } from "../../shared/branch-governance"

export const CANONICAL_SDD_SEQUENCE = ["constitution", "specify", "clarify", "plan", "start-work"] as const

export function getCanonicalSddSequence(): readonly string[] {
  return CANONICAL_SDD_SEQUENCE
}

export function detectSddBranchPrefix(request: string): {
  prefix: string
  requiresConfirmation: boolean
} {
  const result = classifyPrefixFromContext(request)
  return {
    prefix: result.detectedPrefix ?? "feat",
    requiresConfirmation: result.requiresUserConfirmation,
  }
}

/**
 * Tinker SDD Mode (Specification-Driven Development)
 */

const CONSTITUTION_TEMPLATE = `---
# Constitution

## Principles of Code
- Clean code with no unnecessary comments
- Tests are required for all new functionality
- No unnecessary dependencies

## Quality Standards
- Every feature starts with an approved spec
- Acceptance criteria are measurable
- Edge cases documented before implementation

## Process
- SPECIFY -> CLARIFY -> APPROVE -> PLAN -> /start-work
---
`

export const SDD_MODE_PROMPT = `# SDD MODE ENABLED
SDD=ON
SDD MODE ACTIVE

## CRITICAL INSTRUCTIONS
1. You are in SDD mode.
2. If asked about SDD status, answer EXACTLY: "SDD=ON".
3. Your first response MUST start with SPECIFY questions.

## PRE-SPECIFY: Constitution
Before creating any spec, check if .specify/memory/constitution.md exists.
If missing:
  1. Create .specify/memory/ if needed
  2. Create constitution.md with the standard template
  3. Inform the user: "📋 Constitution created in .specify/memory/constitution.md — review and adjust for your project."

## PHASE SPECIFY
- Create .specify/specs/{slug}/spec.md using the spec template.
- Focus on what and why. No implementation details yet.
- Capture: problem, success criteria, requirements, edge cases, dependencies, open questions.

## PHASE CLARIFY
- If the spec has ambiguities, ask one objective question at a time.
- Record answers in a "Clarifications" section in spec.md.
- Use mirana/keeper only to reduce ambiguity.

## PHASE APPROVE
- Present the spec to the user and wait for explicit approval.
- On approval: update sdd-state.json to { "spec_status": "approved" }.
- Do not move to planning or implementation without approval.
`;

export const SPEC_FILE_OPERATIONS = {
  /**
   * Creates a new specification file with the given content
   */
  createSpec: (slug: string, content: string): string => {
    return `write(".specify/specs/${slug}/spec.md", \`${content}\`)`;
  },

  /**
   * Appends a section to an existing specification
   */
  appendSection: (slug: string, sectionTitle: string, content: string): string => {
    return `edit(".specify/specs/${slug}/spec.md", 
  oldText="## Open Questions", 
  newText="## ${sectionTitle}\n${content}\n\n## Open Questions")`;
  },

  /**
   * Marks a question as resolved in the spec
   */
  resolveQuestion: (slug: string, question: string, answer: string): string => {
    return `edit(".specify/specs/${slug}/spec.md",
  oldText="- [ ] ${question}",
  newText="- [x] ${question}\n  **Answer**: ${answer}")`;
  },

  /**
   * Updates an acceptance criterion in the spec
   */
  updateAcceptanceCriterion: (
    slug: string,
    reqId: string,
    criterion: string,
    newCriterion: string
  ): string => {
    return `edit(".specify/specs/${slug}/spec.md",
  oldText="### ${reqId}: *\n**Acceptance Criteria**:",
  newText="### ${reqId}: *\n**Acceptance Criteria**:\n- ${newCriterion}")`;
  },

  /**
   * Marks spec as approved
   */
  markApproved: (slug: string): string => {
    return `edit(".specify/specs/${slug}/spec.md",
  oldText="# Specification: ${slug}",
  newText="# Specification: ${slug}\n\n**Status**: APPROVED")`;
  },
};

export async function ensureConstitution(projectRoot: string): Promise<{ created: boolean; path: string }> {
  const filePath = join(projectRoot, ".specify/memory/constitution.md")
  try {
    await access(filePath)
    return { created: false, path: filePath }
  } catch {
    await mkdir(dirname(filePath), { recursive: true })
    await writeFile(filePath, CONSTITUTION_TEMPLATE, "utf8")
    return { created: true, path: filePath }
  }
}
