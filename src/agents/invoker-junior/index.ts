import { INVOKER_JUNIOR_DEFAULTS as _INVOKER_JUNIOR_DEFAULTS } from "./agent";
export { buildDefaultInvokerJuniorPrompt } from "./default"
export { buildGptInvokerJuniorPrompt } from "./gpt"

export {
  INVOKER_JUNIOR_DEFAULTS,
  getInvokerJuniorPromptSource,
  buildInvokerJuniorPrompt,
  createInvokerJuniorAgentWithOverrides,
} from "./agent"
export const SPECIFY_JUNIOR_DEFAULTS = _INVOKER_JUNIOR_DEFAULTS;
export type { InvokerJuniorPromptSource } from "./agent"
