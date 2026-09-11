# 9Router Provider Plugin

Adds [9Router](https://github.com/decolua/9router) as a first-class OpenCode provider with **auto-discovered models** and **resolved thinking levels**.

## What It Does

- **Config-only onboarding**: supply only the `baseURL` (default `http://localhost:20128/v1`) and an API key. No hand-written `models` block.
- **Auto-discovery**: fetches `GET {baseURL}/v1/models` at startup and maps every model to an OpenCode model entry (reasoning, tool-call, vision, context/output limits). Cached for 5 minutes.
- **Thinking-level resolution**: per model, emits the reasoning variants `/models` will show, translated to the request body 9Router's upstream expects:

| 9Router `thinkingFormat` | Variant body |
|---|---|
| `openai` | `reasoning_effort: none\|low\|medium\|high\|xhigh` (max clamps to xhigh) |
| `zai` (GLM) | `reasoning_effort: low\|high` (+xhigh/max when `thinkingEffortSupported`) |
| `deepseek` | `thinking:{type:enabled}` + `reasoning_effort: high\|max` (low/medium collapse to high) |
| `kimi` | `reasoning_effort: low\|medium\|high` |
| `minimax` | `thinking:{type:adaptive}` (M2.x/M3 cannot disable) |
| `qwen` | `enable_thinking` + `thinking_budget` |
| budget-style (claude/gemini) | `thinking:{type:enabled, budget_tokens}` |

Level budgets follow 9Router's own `LEVEL_TO_BUDGET` map (none:0, minimal:512, low:1024, medium:8192, high:24576, xhigh:32768, max:128000), clamped by `capabilities.thinkingRange` when present. Models with `thinkingCanDisable:false` never get a `none` variant. Duplicate bodies are deduplicated so `/models` never lists two variants that send identical requests.

## Installation

Copy the plugin directory into your OpenCode config and register it:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    ["file:///path/to/Opencode-Workflows/plugins/9router", {}]
  ],
  "provider": {
    "9router": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "9Router",
      "options": {
        "baseURL": "http://localhost:20128/v1"
      }
    }
  }
}
```

Then connect your key:

- Run `/connect` and pick **9Router** (API key method; you can also enter a custom base URL there), **or**
- Export `NINE_ROUTER_API_KEY`.

## Options

| Where | Key | Meaning |
|---|---|---|
| plugin options | `baseURL` | Router endpoint (default `http://localhost:20128/v1`) |
| env | `NINE_ROUTER_API_KEY` / `ROUTER_API_KEY` | Bearer key |
| env | `NINE_ROUTER_BASE_URL` / `ROUTER_BASE_URL` | Endpoint override |

## How It Works

The plugin registers the `9router` provider via the `config` hook, injects the discovered model catalog into `provider.9router.models` (opencode's `provider.models` hook only runs for providers already in the models.dev catalog, so a config-only provider must inject through `config`), and resolves the API key from plugin options, env, or the stored `/connect` credential (read from opencode's `auth.json` before the auth loader runs). A `provider.models` hook is still exposed for when 9Router appears in the models.dev catalog.

## Files

- `index.ts` — plugin: `config`, `auth`, `provider.models` hooks
- `thinking.ts` — level map + per-format body translation
- `selfcheck.ts` — `bun run selfcheck.ts [baseURL]` runs the resolver against a live router

## Notes

- Combo models show up for free — they are plain entries in `/v1/models`.
- Cost is reported as zero because 9Router does not expose per-model pricing; usage counts stay well-defined.
- The router normalizes thinking bodies itself; variants only emit top-level keys it understands (`reasoning_effort`, `thinking`, `enable_thinking`, `thinking_budget`).