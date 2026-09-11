// 9Router thinking-level resolution.
//
// Levels and budgets mirror 9Router's own source of truth:
// open-sse/translator/concerns/thinking.js (decolua/9router)
//   EFFORT_LEVELS = minimal|low|medium|high|xhigh|max
//   LEVEL_TO_BUDGET = none:0, minimal:512, low:1024, medium:8192,
//                     high:24576, xhigh:32768, max:128000
//
// A "thinking format" describes the request-body shape 9Router expects for a
// model. 9Router normalizes the body itself per format (thinkingUnified.js),
// so variants only need to emit the right top-level keys.

/** Ordered low -> high. */
export const EFFORT_LEVELS = [
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const

export type EffortLevel = (typeof EFFORT_LEVELS)[number]

/** Web-standard level -> budget_tokens (Anthropic/Gemini docs, via 9router). */
export const LEVEL_TO_BUDGET: Record<EffortLevel, number> = {
  none: 0,
  minimal: 512,
  low: 1024,
  medium: 8192,
  high: 24576,
  xhigh: 32768,
  max: 128000,
}

/** Request-body patch a variant contributes. Applied as providerOptions["9router"]. */
export type Body = Record<string, unknown>

export type Capabilities = {
  reasoning: boolean
  /** Model cannot disable thinking: clamp "none" instead of emitting a disable body. */
  canDisable: boolean
  /** Server advertises a discrete-effort ladder. */
  effortSupported: boolean
  /** [min, max] budget when known, else null. */
  range: [number, number] | null
}

export type Format =
  | "openai"
  | "zai"
  | "deepseek"
  | "kimi"
  | "minimax"
  | "qwen"
  | "budget" // claude/gemini/hunyuan-style { thinking: { type, budget_tokens } }
  | "none"

/** Clamp a budget into an optional thinkingRange. */
function clampBudget(budget: number, range: [number, number] | null): number {
  if (!range) return budget
  const [min, max] = range
  if (Number.isFinite(min) && budget < min) budget = min
  if (Number.isFinite(max) && budget > max) budget = max
  return budget
}

/**
 * Resolve which effort levels a model exposes.
 *
 * 1. thinkingEffortSupported -> full ladder
 * 2. thinkingRange present   -> levels whose budget fits the range
 * 3. format/family heuristics
 */
export function resolveLevels(
  format: Format,
  caps: Capabilities,
  modelId: string,
): EffortLevel[] {
  const id = modelId.toLowerCase()

  const noneFirst: EffortLevel[] = caps.canDisable ? ["none"] : []

  if (caps.effortSupported) {
    // zai GLM-5.3+: discrete low|high (+ effort pass-through); openai-style full.
    if (format === "zai") return [...noneFirst, "low", "high", "xhigh", "max"]
    return [...noneFirst, "low", "medium", "high", "xhigh", "max"]
  }

  if (caps.range) {
    const [min, max] = caps.range
    const fits = (lvl: EffortLevel) => {
      const b = LEVEL_TO_BUDGET[lvl]
      return b >= (Number.isFinite(min) ? min : 0) && b <= (Number.isFinite(max) ? max : Infinity)
    }
    const set = [...noneFirst, "low", "medium", "high", "xhigh", "max"].filter(
      (l) => l === "none" || fits(l),
    )
    return set as EffortLevel[]
  }

  // Family first: some ids carry their own thinking interface regardless of format.
  if (id.includes("nemotron")) {
    // Nemotron 3 has no discrete thinking controls on this gateway: one shot.
    return caps.canDisable ? ["none", "high"] : []
  }

  switch (format) {
    case "openai":
      // gpt families: xhigh is top; "max" is not a native openai enum.
      return [...noneFirst, "low", "medium", "high", "xhigh"]
    case "zai":
      // GLM without effort support: enable/disable + low|high effort (5.2 reads reasoning_effort).
      return [...noneFirst, "low", "high"]
    case "deepseek":
      // deepseek maps low/medium -> high upstream; v4 adds native max.
      return id.includes("deepseek-v4")
        ? [...noneFirst, "high", "max"]
        : [...noneFirst, "high"]
    case "kimi":
      return [...noneFirst, "low", "medium", "high"]
    case "minimax":
      // Adaptive: one on/off toggle is all the format can express.
      return caps.canDisable ? ["none", "high"] : []
    case "qwen":
      return [...noneFirst, "high"]
    case "budget":
      return [...noneFirst, "low", "medium", "high", "xhigh", "max"]
    case "none":
      return []
  }
}

/**
 * Map a resolved level to the request-body keys for the model's format.
 * Must match 9Router's applyThinking switch (thinkingUnified.js) so the
 * upstream provider receives exactly what it expects.
 */
export function levelToBody(
  format: Format,
  level: EffortLevel,
  caps: Capabilities,
  modelId: string,
): Body {
  const id = modelId.toLowerCase()
  const budget = clampBudget(LEVEL_TO_BUDGET[level], caps.range)
  const disable: Body = { thinking: { type: "disabled" } }

  switch (format) {
    case "openai":
      // openai enum: none|minimal|low|medium|high|xhigh (no "max")
      if (level === "none") return { reasoning_effort: "none" }
      if (level === "max") return { reasoning_effort: "xhigh" }
      return { reasoning_effort: level }

    case "zai": {
      // z.ai reads reasoning_effort from GLM-5.2 onward; disable only when allowed.
      if (level === "none") return caps.canDisable ? disable : { reasoning_effort: "low" }
      if (level === "low") return { reasoning_effort: "low" }
      if (level === "medium") return { reasoning_effort: "low" } // zai has no medium
      if (level === "high") return { reasoning_effort: "high" }
      return { reasoning_effort: "high" } // xhigh/max clamp: zai caps at high
    }

    case "deepseek": {
      // low/medium -> high, xhigh/max -> max (9router mapping)
      if (level === "none") return caps.canDisable ? disable : enabledHigh()
      if (level === "minimal" || level === "low" || level === "medium")
        return enabledHigh()
      return { thinking: { type: "enabled" }, reasoning_effort: "max" }
    }

    case "kimi": {
      if (level === "none") return caps.canDisable ? disable : enabledKimi()
      // kimi accepts low|medium|high; higher levels clamp to high
      const effort =
        level === "minimal" || level === "low" ? "low" : level === "medium" ? "medium" : "high"
      return { thinking: { type: "enabled" }, reasoning_effort: effort }
    }

    case "minimax":
      // M2.x/M3 are adaptive; budget fields are ignored upstream.
      if (level === "none") return caps.canDisable ? disable : { thinking: { type: "adaptive" } }
      return { thinking: { type: "adaptive" } }

    case "qwen":
      if (level === "none") return caps.canDisable ? { enable_thinking: false } : high()
      return { enable_thinking: true, thinking_budget: budget || undefined }

    case "budget":
      if (level === "none") return caps.canDisable ? disable : budgetBody(-1)
      return budgetBody(budget)

    case "none":
      return {}
  }

  function enabledHigh(): Body {
    return { thinking: { type: "enabled" }, reasoning_effort: "high" }
  }
  function enabledKimi(): Body {
    return { thinking: { type: "enabled" }, reasoning_effort: "high" }
  }
  function high(): Body {
    return { enable_thinking: true, thinking_budget: LEVEL_TO_BUDGET.high }
  }
  function budgetBody(b: number): Body {
    return b === -1
      ? { thinking: { type: "enabled" } }
      : { thinking: { type: "enabled", budget_tokens: b } }
  }
}

/**
 * Build the variants record for one model.
 * Dedup invariant: if two levels produce byte-identical bodies, keep the
 * higher-level name so /models never shows two identical variants.
 */
export function buildVariants(
  format: Format,
  caps: Capabilities,
  modelId: string,
): Record<string, Body> {
  const levels = resolveLevels(format, caps, modelId)
  if (levels.length === 0) return {}
  const out: Record<string, Body> = {}
  const seen = new Map<string, EffortLevel>()
  for (const level of levels) {
    const body = levelToBody(format, level, caps, modelId)
    const key = JSON.stringify(body)
    const dup = seen.get(key)
    if (dup !== undefined) {
      // identical body already emitted at a lower level -> drop this one
      continue
    }
    seen.set(key, level)
    out[level] = body
  }
  return out
}

/** Classify a 9Router model id + thinkingFormat into our Format union. */
export function classifyFormat(
  thinkingFormat: string | null | undefined,
  modelId: string,
  reasoning = false,
): Format {
  switch (thinkingFormat) {
    case "openai":
      return "openai"
    case "zai":
      return "zai"
    case "deepseek":
      return "deepseek"
    case "kimi":
      return "kimi"
    case "minimax":
      return "minimax"
    case "qwen":
      return "qwen"
    default: {
      // null format + reasoning: upstream is OpenAI-compatible (ollama,
      // generic gateways) and reads reasoning_effort. Non-reasoning models
      // must stay "none" or buildVariants would emit thinking bodies for
      // models that reject them.
      if (!thinkingFormat || !reasoning) {
        if (!reasoning) return "none"
        const id = modelId.toLowerCase()
        if (
          id.includes("claude") ||
          id.includes("gemini") ||
          id.includes("o1") ||
          id.includes("o3") ||
          id.includes("o4")
        ) {
          return "budget"
        }
        return "openai"
      }
      return "none"
    }
  }
}