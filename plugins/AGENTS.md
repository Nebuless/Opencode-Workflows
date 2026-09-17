# Plugins

<purpose>
## Purpose

- This directory contains OpenCode plugin packages and source-only plugin examples.
</purpose>

<ownership>
## Ownership

- Each plugin directory that owns package metadata MUST be treated as an independent package boundary.
- Each package-owning plugin MUST own its manifest, version, dependencies, scripts, README, exports, and publish payload.
- `gemini-glm-focused-mode/` is a source-only plugin example and MUST NOT be described as an npm package unless package metadata is added.
</ownership>

<local_contracts>
## Local Contracts

- Package work MUST follow [npm Plugin Authoring and Publishing](../docs/npm-plugin-authoring-and-publishing.md).
- Maintainers MUST run release commands from the target plugin directory or with `npm --prefix plugins/<plugin-name>`.
- Maintainers MUST NOT publish from repository root.
- Credentials, npm tokens, OTPs, and API keys MUST NOT enter source, documentation, commits, or package payloads.
</local_contracts>

<work_guidance>
## Work Guidance

- Changes SHOULD stay inside one plugin boundary unless shared documentation also requires an update.
- Package manifests and user-facing installation pins MUST use the same intended version.
- Publish allowlists SHOULD include only runtime files and required package documentation.
</work_guidance>

<verification>
## Verification

- Maintainers MUST run package-specific checks and inspect `npm pack --dry-run` output before release approval.
- Maintainers MUST use `npm publish --dry-run` to check payload and registry authorization without publishing.
- Published releases MUST be checked through registry metadata and a clean OpenCode runtime test before announcement.
</verification>

<child_dox_index>
## Child DOX Index

- [`9router/AGENTS.md`](9router/AGENTS.md): Package, source, verification, and release contract for 9Router provider plugin.
</child_dox_index>
