/**
 * Boulder State Types
 *
 * Manages the active work plan state for Invoker orchestrator.
 * Named after Invoker's boulder - the eternal task that must be rolled.
 */

export interface BoulderState {
  /** Absolute path to the active plan file */
  active_plan: string
  /** ISO timestamp when work started */
  started_at: string
  /** Session IDs that have worked on this plan */
  session_ids: string[]
  /** Plan name derived from filename */
  plan_name: string
  /** Agent type to use when resuming (e.g., 'axe') */
  agent?: string
  /** Optional path to spec-kit tasks file */
  tasksFilePath?: string
  /** Whether spec-kit tasks integration is enabled */
  useSpecKitTasks?: boolean
}

export interface PlanProgress {
  /** Total number of checkboxes */
  total: number
  /** Number of completed checkboxes */
  completed: number
  /** Whether all tasks are done */
  isComplete: boolean
}
