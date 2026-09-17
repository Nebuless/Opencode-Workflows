## Purpose

<purpose>
This directory owns internal OpenCode tooling for maintaining this repository.
It is not globally installable without adaptation to another repository's structure and rules.
</purpose>

## Ownership

<ownership>
- This contract owns the repository maintenance agent, commands, skill, references, and scripts under `.opencode/`.
- Root `AGENTS.md` owns repository-wide constraints and DOX rules.
- Maintainers MUST adapt paths, metadata checks, and repository assumptions before reusing these tools elsewhere.
</ownership>

## Local Contracts

<local_contracts>
- Maintenance prompts MUST use RFC 2119 uppercase requirements and XML wrapper blocks.
- Commands, agent instructions, skill guidance, and scripts MUST describe the same maintenance workflow.
- Internal maintenance tooling MUST NOT be presented as ready for global installation.
- Changes MUST preserve one-shot operation and MUST NOT introduce watch or server processes.
</local_contracts>

## Work Guidance

<work_guidance>
- Keep repository-specific checks explicit and close to the maintenance skill.
- Update related command or skill text when a script path or maintenance contract changes.
- Prefer narrow edits over new maintenance layers or duplicate validators.
</work_guidance>

## Verification

<verification>
- Run `python3 .opencode/skill/repo-maintenance/scripts/audit_repo.py` for structural and configuration checks.
- Run `python3 .opencode/skill/repo-maintenance/scripts/sync_docs.py` for inventory and documentation drift checks.
- Audit findings MUST follow the approval workflow in the repository maintenance skill before fixes are applied.
</verification>

## Child DOX Index

<child_dox_index>
No direct child `AGENTS.md` files are currently owned.
</child_dox_index>
