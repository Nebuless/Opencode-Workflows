// Self-check for the 9Router plugin's thinking resolution.
// Usage: bun run selfcheck.ts [baseURL]
// Asserts: live model list parses, every reasoning model gets non-empty
// variants, bodies are well-formed per format, dedup invariant holds.

import { classifyFormat, buildVariants, levelToBody, resolveLevels } from "./thinking"
import type { Format, Capabilities } from "./thinking"

const baseURL = (process.argv[2] ?? process.env.NINE_ROUTER_BASE_URL ?? "http://zo-computer:20128/v1").replace(/\/$/, "")

let failures = 0
function assert(cond: boolean, msg: string) {
  if (!cond) {
    failures++
    console.error("FAIL:", msg)
  } else {
    console.log("ok:", msg)
  }
}

const resp = await fetch(baseURL + "/models")
assert(resp.ok, `GET ${baseURL}/models -> ${resp.status}`)
const json = (await resp.json()) as {
  data?: Array<{
    id: string
    capabilities?: {
      reasoning?: boolean
      thinkingFormat?: string | null
      thinkingCanDisable?: boolean
      thinkingEffortSupported?: boolean
      thinkingRange?: [number, number] | null
    }
  }>
}
const models = json.data ?? []
assert(models.length > 0, `model count = ${models.length}`)

const formatCounts = new Map<Format, number>()
for (const m of models) {
  const caps = m.capabilities ?? {}
  const format = classifyFormat(caps.thinkingFormat, m.id, caps.reasoning === true)
  formatCounts.set(format, (formatCounts.get(format) ?? 0) + 1)

  const full: Capabilities = {
    reasoning: caps.reasoning === true,
    canDisable: caps.thinkingCanDisable !== false,
    effortSupported: caps.thinkingEffortSupported === true,
    range: caps.thinkingRange ?? null,
  }
  const variants = buildVariants(format, full, m.id)

  if (!full.reasoning) {
    assert(Object.keys(variants).length === 0, `${m.id}: non-reasoning -> no variants`)
    continue
  }
  // Adaptive formats with no disable path (minimax-m2.x) have nothing to vary.
  const adaptiveNoDisable = !full.canDisable && !full.effortSupported && !full.range
  if (!adaptiveNoDisable) {
    assert(Object.keys(variants).length > 0, `${m.id}: reasoning model has variants`)
  }

  // "none" must never disable when the model can't disable thinking
  if (!full.canDisable && variants["none"]) {
    const body = JSON.stringify(variants["none"])
    assert(
      !body.includes('"disabled"') && !body.includes('"type":"disabled"'),
      `${m.id}: none variant does not disable thinking`,
    )
  }

  // bodies must be plain objects with only known top-level keys
  for (const [lvl, body] of Object.entries(variants)) {
    const keys = Object.keys(body)
    const allowed = ["reasoning_effort", "thinking", "enable_thinking", "thinking_budget"]
    assert(
      keys.every((k) => allowed.includes(k)),
      `${m.id}/${lvl}: keys ${keys.join(",")} are known body keys`,
    )
  }

  // dedup: variant bodies are unique
  const bodies = new Set(Object.values(variants).map((b) => JSON.stringify(b)))
  assert(bodies.size === Object.keys(variants).length, `${m.id}: variants are distinct bodies`)

  // default variant exists (unless the model has nothing to vary)
  if (Object.keys(variants).length > 0) {
    assert(
      variants["medium"] !== undefined || variants["high"] !== undefined || variants["low"] !== undefined,
      `${m.id}: has a usable default level`,
    )
  }
}

console.log("\nformat distribution:", [...formatCounts].map(([f, n]) => `${f}:${n}`).join(" "))

// spot-check the xhigh/max contract
const gpt = models.find((m) => m.id.startsWith("cx/gpt"))
if (gpt) {
  const caps: Capabilities = { reasoning: true, canDisable: true, effortSupported: false, range: null }
  const v = buildVariants("openai", caps, gpt.id)
  assert(v["xhigh"] !== undefined, `${gpt.id}: xhigh present`)
  assert(v["max"] === undefined || JSON.stringify(v["max"]) === JSON.stringify(v["xhigh"]), `${gpt.id}: max not offered separately on openai`)
}
const glm = models.find((m) => (m.capabilities as { thinkingEffortSupported?: boolean })?.thinkingEffortSupported === true)
if (glm) {
  const caps: Capabilities = { reasoning: true, canDisable: true, effortSupported: true, range: null }
  const v = buildVariants(
    classifyFormat((glm.capabilities as { thinkingFormat?: string | null }).thinkingFormat, glm.id, true),
    caps,
    glm.id,
  )
  // glm-5.3 is zai: caps at high even with effortSupported (zai enum has no max)
  assert(v["high"] !== undefined, `${glm.id}: effortSupported model has high`)
}

if (failures > 0) {
  console.error(`\n${failures} failure(s)`)
  process.exit(1)
}
console.log("\nall checks passed")