# 9Router Plugin

<purpose>
## Purpose

- This package registers 9Router as an OpenCode provider, discovers models, and builds model-specific thinking variants.
- Current published package identity is `@nebulesstech/opencode-9router@0.1.1`.
</purpose>

<ownership>
## Ownership

- `index.ts` MUST own provider registration, configuration, authentication lookup, endpoint selection, and model discovery.
- `thinking.ts` MUST own thinking-level mapping and variant generation.
- `selfcheck.ts` MUST own live discovery and resolver checks.
- `package.json` MUST own package identity, version, scripts, exports, engine constraints, and publish allowlist.
- `README.md` MUST own user setup, security, verification, release guidance, and
  links to the root-owned `../../9router-gpt-only/` portable GPT-only bundle.
</ownership>

<local_contracts>
## Local Contracts

- Allowed package payload MUST be `index.ts`, `thinking.ts`, `README.md`, and npm-required `package.json` only.
- `selfcheck.ts` and `opencode.json` MUST remain excluded from package payloads.
- README installation pins and package identity text MUST match `package.json` version `0.1.1` until version changes deliberately.
- API keys MUST NOT enter source, committed configuration, logs, issue reports, documentation examples as real values, or package payloads.
- Remote gateways MUST use HTTPS; plain HTTP SHOULD remain limited to trusted local development.
- Portable preset guidance MUST keep `provider.9router.models` absent so plugin
  discovery can generate thinking variants.
</local_contracts>

<work_guidance>
## Work Guidance

- Maintainers MUST work from `plugins/9router` or use `npm --prefix plugins/9router`.
- Runtime changes MUST preserve zero-build ESM TypeScript loading unless package metadata and README are updated together.
- Release version changes MUST update `package.json` and every README installation pin in the same change.
- Publishing MUST require explicit approval and an authorized npm account.
</work_guidance>

<verification>
## Verification

- Maintainers MUST run `npm --prefix plugins/9router run selfcheck -- <trusted-base-url>` against a suitable test gateway.
- Maintainers MUST run `npm --prefix plugins/9router run pack:check` and inspect the exact file list for excluded files and secrets.
- Maintainers MUST run `npm --prefix plugins/9router publish --dry-run` before any approved publish.
- Maintainers SHOULD smoke-test local loading through a separate OpenCode configuration before release approval.
- After publishing, maintainers MUST verify exact registry name and version, clean OpenCode installation, startup, discovery, and inference before announcing success.
</verification>

<child_dox_index>
## Child DOX Index

- None.
</child_dox_index>
