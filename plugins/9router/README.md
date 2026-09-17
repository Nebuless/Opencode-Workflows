# 9Router for OpenCode

`@nebulesstech/opencode-9router` version **0.1.1** registers
[9Router](https://github.com/decolua/9router) as an OpenCode provider, discovers
models, and generates model-specific thinking variants. It does not run the gateway.

## For Users

### Install and Configure

Run a trusted 9Router gateway and obtain its API key. The default API base URL is
`http://localhost:20128/v1`.

Add this to your project `opencode.json` or global
`~/.config/opencode/opencode.json`, merging with existing settings:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@nebulesstech/opencode-9router@0.1.1"],
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

OpenCode auto-installs npm plugins at startup. No separate `npm install`, clone,
or build is required for users. This package ships ESM TypeScript for OpenCode's
plugin loader, not a compiled JavaScript library for plain Node.js imports.
The explicit provider block makes the endpoint visible; the plugin can register
it without that block. No hand-written `models` block is needed for discovery.

These instructions target the published `0.1.1` release. Package metadata alone
does not establish that a release exists. A registry 404 can mean unpublished or
inaccessible; confirm release availability with the maintainer.

### Authenticate

Start OpenCode, run `/connect`, select **9Router**, and provide the gateway API
key. Restart OpenCode afterward so startup discovery sees the stored credential.
The plugin reads the `9router` entry in
`~/.local/share/opencode/auth.json` before OpenCode's auth loader runs.

For environment-based setup, inject `NINE_ROUTER_API_KEY` securely before starting
OpenCode (`ROUTER_API_KEY` is the fallback). Also add this to the provider's
`options` for inference authentication:

```json
{
  "baseURL": "http://localhost:20128/v1",
  "apiKey": "{env:NINE_ROUTER_API_KEY}"
}
```

Use `{env:ROUTER_API_KEY}` instead if using that fallback. Discovery resolves keys
in this order: nonempty plugin tuple `apiKey`, `NINE_ROUTER_API_KEY`,
`ROUTER_API_KEY`, stored credential. Provider `options.apiKey` is not read by the
discovery resolver. The auth loader returns an empty object and relies on
OpenCode to supply stored credentials for inference; discovery-only keys are
not copied into provider options. Unset unused environment variables rather
than leaving them empty, since empty values can mask lower-priority credentials.

The `/connect` base URL prompt saves metadata, but this version does not read
that metadata when resolving endpoints. Configure the URL explicitly below.

### Base URL Precedence

Startup discovery and the registered provider use the first configured value:

1. `provider.9router.options.baseURL`.
2. Nonempty plugin tuple option `baseURL`.
3. `NINE_ROUTER_BASE_URL`, otherwise `ROUTER_BASE_URL`.
4. `http://localhost:20128/v1`.

The explicit provider URL in the installation example therefore overrides
environment URLs. Remove that field if you want environment selection. Keep
environment values unset when unused. For tuple-capable OpenCode versions:

```json
{
  "plugin": [
    ["@nebulesstech/opencode-9router@0.1.1", {"baseURL": "https://router.example.com/v1"}]
  ]
}
```

The separate `provider.models` hook uses tuple/environment/default precedence,
not the provider option. Startup discovery uses the `config` hook for this
config-only provider. Keep endpoint settings consistent if using both hooks.

### Discovery and Thinking

Discovery requests `GET <baseURL>/models`, for example
`http://localhost:20128/v1/models`, with a bearer key. Do not append another `/v1`.
Without a resolved key, discovery is skipped even if the gateway allows public
model listing. Successful results are cached in memory for five minutes per
base URL; this is not a background refresh timer. Restart after credential or
configuration changes. Existing user-defined model entries win by model ID.
Failures leave the provider registered with any manually configured models.

Discovery maps reasoning, tools, vision, and context/output limits. Missing
limits default to 200,000 context tokens and at most 32,000 output tokens.
Reported costs are zero placeholders, not a promise of free usage. Combo models
appear when returned by the gateway's model list.

Thinking variants depend on capability metadata, format, and model-ID heuristics:

| Format | Current request fields |
| --- | --- |
| OpenAI | `reasoning_effort`; `max` maps to `xhigh` |
| Z.ai / GLM | `reasoning_effort: low` or `high`; higher levels clamp to `high` |
| DeepSeek | Enabled `thinking` plus `reasoning_effort`; current mapping sends `high` for minimal/low/medium and `max` for high/xhigh/max |
| Kimi | Enabled `thinking` plus low/medium/high `reasoning_effort` |
| MiniMax | Adaptive `thinking`; some models have no selectable variants |
| Qwen | `enable_thinking` and `thinking_budget` |
| Budget-style | Enabled `thinking` with `budget_tokens` |

Budget map: none 0, minimal 512, low 1,024, medium 8,192, high 24,576,
xhigh 32,768, max 128,000. The resolver filters or clamps against advertised
`thinkingRange`; it does not expose every named level for every model.
`thinkingCanDisable: false` removes `none`. Identical bodies are deduplicated,
keeping the first generated level. Missing format metadata uses reasoning and
model-name heuristics; unknown formats may yield no variants. Variant labels
are not guarantees of distinct upstream effort or quality.

### Verify and Troubleshoot

Restart OpenCode, open `/models`, and choose a discovered 9Router model. Run a
small prompt using its exact ID, preserving any gateway prefix:

```sh
opencode run --model '9router/<model-id>' 'Say OK'
```

Replace `<model-id>` with an actual discovered ID. Check available variants in
OpenCode and select one supported by that model. Successful listing verifies
discovery; a successful response separately verifies inference authentication.

| Symptom | Check |
| --- | --- |
| npm 404 / plugin not installed | Confirm package/version publication and registry access; do not substitute a raw source URL |
| No models | Confirm resolved key, endpoint reachability, and a JSON `data` array from `/models`; startup discovery failures are swallowed |
| HTTP 401/403 | Check gateway key and separate discovery/inference key configuration |
| HTTP 404 from gateway | Use API base URL ending in `/v1`, not `/v1/models` or `/v1/v1` |
| Wrong endpoint | Check provider URL first; `/connect` URL metadata is not used |
| Missing thinking variants | Check capabilities, range filtering, deduplication, and adaptive models with nothing to vary |
| Old models or changed key ignored | Restart; cache is keyed by URL, not credential |

### Security

API keys MUST NOT enter source files or committed configuration. Use `/connect`
or environment substitution, protect the auth file, and redact keys from logs
and issue reports. Rotate any exposed credential. Only configure trusted
gateways: discovery sends the bearer key to the resolved URL, and inference
sends prompts and model traffic to the provider endpoint. Use HTTPS for remote
gateways; keep plain HTTP limited to trusted local development. Review plugins
before installing because they execute inside OpenCode.

## For Maintainers

Work from `plugins/9router`. `package.json` defines public scoped package
`@nebulesstech/opencode-9router@0.1.1`, Node.js `>=20`, and zero-build ESM export
`./index.ts`. OpenCode supplies the TypeScript-capable loader; the Node engine
does not imply native Node can resolve the current extensionless TS imports.

Published files are `index.ts`, `thinking.ts`, `README.md`, and npm's mandatory
`package.json`. `selfcheck.ts` and local `opencode.json` stay in the repository.
`@opencode-ai/plugin` is development-only because its source import is type-only;
its pinned version matches this repository's SDK dependency. No build tooling
or runtime dependencies are bundled. No license is asserted by this manifest.

### Checks and Local Loading

With Bun installed and a suitable live gateway, run:

```sh
npm run selfcheck -- http://localhost:20128/v1
npm run pack:check
```

The self-check makes a live `/models` request and checks resolver invariants;
it is not an authenticated end-to-end inference test. It sends no authorization
header and does not read API-key variables. Use a trusted test endpoint that
permits model listing without authentication; do not disable production auth.
Always pass the URL: its fallback is `NINE_ROUTER_BASE_URL`, then the existing
development address `http://zo-computer:20128/v1`, not the plugin default.
`pack:check` runs `npm pack --dry-run`; inspect its file list for unexpected files
or secrets. It does not publish or prove OpenCode compatibility.

For a local smoke test, replace the npm plugin entry in a separate OpenCode
configuration with `file:///absolute/path/to/Opencode-Workflows/plugins/9router/index.ts`.
Keep `thinking.ts` alongside it. Repeat the user verification flow against a test
gateway. Do not load local and npm copies together.

### Release Flow

1. Review runtime changes and publication rights. Resolve licensing deliberately; do not invent a license field.
2. Run the live self-check and OpenCode smoke test above. Record actual results and any limitations.
3. Confirm npm account `nebulesstech` has scope access. Check registry state; a 404 alone does not prove name availability.
4. Set the intended version in `package.json` and update README installation pins. Run `npm run pack:check` and review the exact payload.
5. Only after explicit release approval, an authorized maintainer publishes from this directory with public access. `publishConfig.access` is already `public`.
6. Verify the published name/version and clean OpenCode startup installation, discovery, and inference before announcing the release.

This guide describes a release procedure, not evidence that publishing or live
verification has occurred. npm versions are immutable; fixes require a new version.
