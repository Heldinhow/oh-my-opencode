import type { OhMyOpenCodeConfig } from "../config";

type AgentWithPermission = { permission?: Record<string, unknown> };

export function applyToolConfig(params: {
  config: Record<string, unknown>;
  pluginConfig: OhMyOpenCodeConfig;
  agentResult: Record<string, unknown>;
}): void {
  const denyTodoTools = params.pluginConfig.experimental?.task_system
    ? { todowrite: "deny", todoread: "deny" }
    : {}

  params.config.tools = {
    ...(params.config.tools as Record<string, unknown>),
    "grep_app_*": false,
    LspHover: false,
    LspCodeActions: false,
    LspCodeActionResolve: false,
    "task_*": false,
    teammate: false,
    ...(params.pluginConfig.experimental?.task_system
      ? { todowrite: false, todoread: false }
      : {}),
  };

  const isCliRunMode = process.env.OPENCODE_CLI_RUN_MODE === "true";
  const questionPermission = isCliRunMode ? "deny" : "allow";

  if (params.agentResult.keeper) {
    const agent = params.agentResult.keeper as AgentWithPermission;
    agent.permission = { ...agent.permission, "grep_app_*": "allow" };
  }
  if (params.agentResult["broodmother"]) {
    const agent = params.agentResult["broodmother"] as AgentWithPermission;
    agent.permission = { ...agent.permission, task: "deny", look_at: "deny" };
  }
  if (params.agentResult["axe"]) {
    const agent = params.agentResult["axe"] as AgentWithPermission;
    agent.permission = {
      ...agent.permission,
      task: "allow",
      call_omo_agent: "deny",
      "task_*": "allow",
      teammate: "allow",
      ...denyTodoTools,
    };
  }
  if (params.agentResult.invoker) {
    const agent = params.agentResult.invoker as AgentWithPermission;
    agent.permission = {
      ...agent.permission,
      call_omo_agent: "deny",
      task: "allow",
      question: questionPermission,
      "task_*": "allow",
      teammate: "allow",
      ...denyTodoTools,
    };
  }
  if (params.agentResult.enigma) {
    const agent = params.agentResult.enigma as AgentWithPermission;
    agent.permission = {
      ...agent.permission,
      call_omo_agent: "deny",
      task: "allow",
      question: questionPermission,
      ...denyTodoTools,
    };
  }
  if (params.agentResult["tinker"]) {
    const agent = params.agentResult["tinker"] as AgentWithPermission;
    agent.permission = {
      ...agent.permission,
      call_omo_agent: "deny",
      task: "allow",
      question: questionPermission,
      "task_*": "allow",
      teammate: "allow",
      ...denyTodoTools,
    };
  }
  if (params.agentResult["invoker-junior"]) {
    const agent = params.agentResult["invoker-junior"] as AgentWithPermission;
    agent.permission = {
      ...agent.permission,
      task: "allow",
      "task_*": "allow",
      teammate: "allow",
      ...denyTodoTools,
    };
  }

  params.config.permission = {
    ...(params.config.permission as Record<string, unknown>),
    webfetch: "allow",
    external_directory: "allow",
    task: "deny",
  };
}
