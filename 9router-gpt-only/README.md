# 9Router GPT-Only Presets

Purpose: portable configuration bundle for 9Router GPT routes, role pins, and
dynamic thinking variants. Canonical plugin mechanics live in
[`../plugins/9router/README.md`](../plugins/9router/README.md).

Files:

- `9router-gpt-only-opencode.jsonc`: OpenCode provider, pinned plugins, and role routes.
- `9router-gpt-only-omo.jsonc`: Oh My OpenAgent aliases, agents, categories, profiles, and OpenCode compatibility routes.
- `check-9router-gpt-only.py`: offline preset contract checker.

Role summary: Terra is primary; Luna handles first-pass and explore work; Sol
handles deep, complex, and adversarial review; Astra is planner-only; Oracle
uses Sol at `high`.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT",
"SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this
document are to be interpreted as described in RFC 2119.

<instructions>
Configuration agents MUST merge these presets into existing configuration without replacing unrelated settings. They MUST report target paths, actions, results, and blockers without credentials. They MUST use the pinned npm plugin by default.
</instructions>

<workflow>
1. Inspect destination OpenCode config, OMO config, configuration scopes, and override order. Back up every target outside this repository before editing.
2. Read [canonical plugin guide](../plugins/9router/README.md). Use published `@nebulesstech/opencode-9router@0.1.1` by default.
3. Require a trusted gateway, a nonempty `NINE_ROUTER_API_KEY`, and `NINE_ROUTER_BASE_URL` ending in `/v1`. Remote endpoints MUST use HTTPS. Never log, write, or report API key values.
4. Merge `9router-gpt-only-opencode.jsonc` into deliberate project `opencode.json` or global `~/.config/opencode/opencode.json` target. Preserve unrelated configuration and deduplicate plugin entries.
5. Detect static `provider.9router.models`. Remove a conflicting entry when authorized or report it; matching static model entries override dynamic model thinking variants.
6. Merge `9router-gpt-only-omo.jsonc` into `~/.omo/omo.jsonc`. Preserve existing agents, categories, and profiles outside preset scope; preserve `model_fallback: false`; resolve conflicting routes deliberately.
7. Restart OpenCode. Test discovery and inference separately. Inspect discovered Terra variants. Report paths, merge actions, results, and blockers without credentials.
</workflow>

<constraints>
- Never load npm and local 9Router plugins together.
- Local source loading is OPTIONAL only on user request. Compute its `file://` URL from actual checkout path, use separate target config, and never commit local URL.
- Never add a static 9Router model entry to force variants. Terra variants are metadata-dependent; expected names are `none`, `low`, `medium`, `high`, and `xhigh`, but gateway capabilities can filter them.
- Never put credentials or machine-specific paths in preset files, backups, reports, or commits.
</constraints>

<verification>
Run preset checks from both supported working directories:

```sh
python3 9router-gpt-only/check-9router-gpt-only.py
(cd 9router-gpt-only && python3 check-9router-gpt-only.py)
```

After restart, inspect `/models` for discovered `9router/cx/gpt-5.6-terra`
entries and supported selector variants. Then test inference with one exact
discovered model ID:

```sh
opencode run --model '9router/<discovered-model-id>' 'Say OK'
```

Discovery success proves listing only. Successful response proves inference
separately. Do not claim live gateway inference without performing it.
</verification>
