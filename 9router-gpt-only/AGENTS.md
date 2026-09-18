# 9Router GPT-Only Bundle

<purpose>
## Purpose

- This directory provides portable GPT-only OpenCode and OMO preset artifacts for the 9Router plugin.
</purpose>

<ownership>
## Ownership

- This directory owns `README.md`, both preset configs, and `check-9router-gpt-only.py`.
- `plugins/9router/` owns plugin source, package metadata, runtime behavior, and package README mechanics.
</ownership>

<local_contracts>
## Local Contracts

- Presets MUST remain strict JSON, portable, secret-free, and free of machine paths.
- Presets MUST preserve pinned plugins, GPT-only routing, disabled fallback, and dynamic discovery.
- Presets MUST NOT define `provider.9router.models`; static models block dynamic thinking variants.
- Presets MUST NOT add credentials, local plugin URLs, or fallback routes.
</local_contracts>

<work_guidance>
## Work Guidance

- Keep model-role mappings aligned across OpenCode and OMO configs unless intentional routing changes are verified.
- Use the pinned npm plugin by default. Local source loading is optional, user-requested only, and never committed.
- Keep end-to-end setup in `README.md`; plugin mechanics stay linked from `../plugins/9router/README.md`.
</work_guidance>

<verification>
## Verification

- Run `python3 9router-gpt-only/check-9router-gpt-only.py` from repository root.
- Run `python3 check-9router-gpt-only.py` from this directory.
- Run repository audit and documentation sync after structural or documentation changes.
</verification>

<child_dox_index>
## Child DOX Index

- None.
</child_dox_index>
