## Purpose

<purpose>
This directory owns standalone OpenCode command templates distributed through the command catalog.
</purpose>

## Ownership

<ownership>
- Command templates live under `commands/.opencode/command/`.
- `commands/registry.json` owns catalog names, descriptions, source paths, and install targets.
- Root `AGENTS.md` owns repository-wide constraints and DOX rules.
</ownership>

## Local Contracts

<local_contracts>
- Every command MUST include valid command frontmatter with an accurate description.
- Command logic MUST use XML wrapper blocks and RFC 2119 uppercase requirements.
- Standalone templates MUST NOT depend on unshipped local files or undocumented repository state.
- Entries in `commands/registry.json` MUST match existing command files, names, paths, and targets.
</local_contracts>

## Work Guidance

<work_guidance>
- Keep commands task-focused, portable, and explicit about required tools or context.
- Add, rename, move, or remove a registry entry in the same change as its command file.
- Prefer direct workflows over duplicated policy text or pack-specific assumptions.
- Preserve user input placeholders and execution boundaries when editing command behavior.
</work_guidance>

## Verification

<verification>
- Run `python3 .opencode/skill/repo-maintenance/scripts/audit_repo.py` to validate command structure and configuration.
- Run `python3 .opencode/skill/repo-maintenance/scripts/sync_docs.py` to check catalog and documentation drift.
- Review `commands/registry.json` against `commands/.opencode/command/` after every catalog change.
</verification>

## Child DOX Index

<child_dox_index>
No direct child `AGENTS.md` files are currently owned.
</child_dox_index>
