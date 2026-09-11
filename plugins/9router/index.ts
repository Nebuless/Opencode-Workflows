import { readFileSync } from "node:fs"
import { homedir as osHomedir } from "node:os"
import type { Plugin } from "@opencode-ai/plugin"
import {
  classifyFormat,
  buildVariants,
  type Format,
  type Capabilities,
  type Body,
} from "./thinking"

const PROVIDER_ID = "9router"
const DEFAULT_BASE_URL = "http://localhost:20128/v1"
const CACHE_TTL_MS = 5 * 60 * 1000

type NineRouterCapabilities = {
  vision?: boolean
  tools?: boolean
  reasoning?: boolean
  thinkingFormat?: string | null
  thinkingCanDisable?: boolean
  thinkingEffortSupported?: boolean
  thinkingRange?: [number, number] | null
  contextWindow?: number
  maxOutput?: number
}

type NineRouterModel = {
  id: string
  owned_by?: string
  capabilities?: NineRouterCapabilities
  context_length?: number
  max_completion_tokens?: number
}

type ConfigModel = {
  id?: string
  name?: string
  reasoning?: boolean
  tool_call?: boolean
  attachment?: boolean
  temperature?: boolean
  cost?: Record<string, unknown>
  limit?: { context?: number; output?: number; input?: number }
  options?: Record<string, unknown>
  variants?: Record<string, Body | { disabled?: boolean }>
}

export const NineRouter: Plugin = async (input, options) => {
  // Plugin-level options come from the tuple form: ["file://…", { baseURL }]
  const pluginOptions = (options ?? {}) as Record<string, unknown>

  const resolveBaseURL = (): string => {
    const fromEnv =
      process.env.NINE_ROUTER_BASE_URL ??
      process.env.ROUTER_BASE_URL ??
      undefined
    return (
      (typeof pluginOptions.baseURL === "string" && pluginOptions.baseURL) ||
      fromEnv ||
      DEFAULT_BASE_URL
    )
  }

  const resolveKey = (): string | undefined => {
    const fromOptions =
      typeof pluginOptions.apiKey === "string" && pluginOptions.apiKey
        ? pluginOptions.apiKey
        : undefined
    return (
      fromOptions ??
      process.env.NINE_ROUTER_API_KEY ??
      process.env.ROUTER_API_KEY ??
      storedKey() ??
      undefined
    )
  }

  // The config() hook runs before opencode's auth loader, so the stored
  // /connect credential is read straight from the auth database file.
  function storedKey(): string | undefined {
    try {
      const p = `${osHomedir()}/.local/share/opencode/auth.json`
      const auth = JSON.parse(readFileSync(p, "utf8")) as Record<
        string,
        { type?: string; key?: string; access?: string }
      >
      const entry = auth[PROVIDER_ID]
      if (!entry) return undefined
      return entry.type === "api" ? entry.key : entry.type === "oauth" ? entry.access : entry.key
    } catch {
      return undefined
    }
  }

  let cache: { at: number; models: Record<string, unknown> } | undefined
  let cacheKey: string | undefined

  async function fetchModels(baseURL: string, key?: string) {
    if (cache && cacheKey === baseURL && Date.now() - cache.at < CACHE_TTL_MS) {
      return cache.models
    }
    const url = baseURL.replace(/\/$/, "") + "/models"
    const resp = await fetch(url, {
      headers: key ? { Authorization: `Bearer ${key}` } : {},
    })
    if (!resp.ok) throw new Error(`9router: GET ${url} -> ${resp.status}`)
    const json = (await resp.json()) as { data?: NineRouterModel[] }
    const list = Array.isArray(json.data) ? json.data : []
    const models: Record<string, unknown> = {}
    for (const m of list) {
      if (!m?.id) continue
      models[m.id] = toConfigModel(m)
    }
    cache = { at: Date.now(), models }
    cacheKey = baseURL
    return models
  }

  function toConfigModel(m: NineRouterModel) {
    const caps = m.capabilities ?? {}
    const reasoning = caps.reasoning === true
    const context = caps.contextWindow ?? m.context_length ?? 200_000
    const output = caps.maxOutput ?? m.max_completion_tokens ?? Math.min(context, 32_000)
    const pretty = prettyName(m.id)
    const model: Record<string, unknown> = {
      name: pretty,
      reasoning: reasoning === true,
      tool_call: caps.tools !== false,
      attachment: caps.vision === true,
      temperature: true,
      release_date: "",
      limit: { context, output },
      // 9Router does not expose per-model pricing; zero cost keeps the
      // usage math defined without inventing numbers.
      cost: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
    }
    const variants = buildVariants(
      classifyFormat(caps.thinkingFormat, m.id, caps.reasoning === true),
      {
        reasoning,
        canDisable: caps.thinkingCanDisable !== false,
        effortSupported: caps.thinkingEffortSupported === true,
        range: (caps.thinkingRange as [number, number] | null) ?? null,
      },
      m.id,
    )
    if (Object.keys(variants).length > 0) model.variants = variants
    return model
  }

  return {
    // Register the provider and inject discovered models. The provider.models
    // hook is only consulted for providers that exist in the models.dev
    // catalog, so for a config-only provider the discovery must happen here:
    // config() runs before opencode parses cfg.provider into the database.
    config: async (cfg) => {
      cfg.provider ??= {}
      const existing = cfg.provider[PROVIDER_ID] ?? {}
      const baseURL = existing.options?.baseURL ?? resolveBaseURL()
      const key = resolveKey()
      cfg.provider[PROVIDER_ID] = {
        npm: "@ai-sdk/openai-compatible",
        name: existing.name ?? "9Router",
        options: {
          ...(existing.options ?? {}),
          baseURL,
        },
        models: existing.models ?? {},
      }
      if (!key) return
      try {
        const discovered = await fetchModels(baseURL, key)
        const merged = { ...(cfg.provider[PROVIDER_ID].models as object) }
        for (const [id, model] of Object.entries(discovered)) {
          if (!merged[id]) merged[id] = model
        }
        cfg.provider[PROVIDER_ID].models = merged
      } catch {
        // unreachable router: provider stays registered with whatever the
        // user hand-wrote; opencode will error on that model, not at boot
      }
    },

    auth: {
      provider: PROVIDER_ID,
      // Return {} and let opencode inject options.apiKey from the stored key.
      loader: async () => ({}),
      methods: [
        {
          type: "api",
          label: "9Router API key",
          prompts: [
            {
              key: "baseURL",
              type: "text" as const,
              message: "9Router base URL (leave blank for http://localhost:20128/v1)",
              placeholder: "http://localhost:20128/v1",
            },
          ],
          async authorize(inputs) {
            const key = inputs?.["apiKey"] ?? ""
            if (!key.trim()) return { type: "failed" as const }
            const baseURL = inputs?.["baseURL"]?.trim()
            const metadata: Record<string, string> = {}
            if (baseURL) metadata.baseURL = baseURL
            return {
              type: "success" as const,
              key,
              provider: PROVIDER_ID,
              metadata,
            }
          },
        },
      ],
    },

    provider: {
      id: PROVIDER_ID,
      models: async (_provider, ctx) => {
        const key = resolveKey() ?? keyFromAuth(ctx.auth)
        if (!key) return {}
        const baseURL = resolveBaseURL()
        try {
          return await fetchModels(baseURL, key)
        } catch {
          // unreachable router: expose nothing rather than a broken provider
          return {}
        }
      },
    },
  }
}

function keyFromAuth(auth: unknown): string | undefined {
  if (!auth || typeof auth !== "object") return undefined
  const a = auth as { type?: string; key?: string; access?: string }
  if (a.type === "api") return a.key
  if (a.type === "oauth") return a.access
  if (a.type === "wellknown") return a.key
  return undefined
}

function prettyName(id: string): string {
  const tail = id.includes("/") ? id.slice(id.lastIndexOf("/") + 1) : id
  return tail
    .replace(/[:_]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ")
}

export type { ConfigModel }