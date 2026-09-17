## Purpose

<purpose>
This directory owns self-contained, reusable OpenCode agent packs for global or project-scoped installation.
</purpose>

## Ownership

<ownership>
- Each pack owns its agents, commands, skills, references, README, and registry metadata.
- Root `AGENTS.md` owns repository-wide constraints and DOX rules.
- Pack boundaries MUST remain clear so consumers can copy one pack without hidden dependencies on unrelated packs.
</ownership>

## Local Contracts

<local_contracts>
- Agent prompts MUST use valid frontmatter, RFC 2119 uppercase requirements, and XML wrapper blocks.
- Every pack MUST keep its README and registry metadata aligned with shipped files, names, paths, and install targets.
- Agents MUST follow least privilege by enabling only tools and skills required for their stated role.
- Supporting commands, skills, and references MUST be included when an agent depends on them.
</local_contracts>

## Work Guidance

<work_guidance>
- Keep each pack self-contained and document required external prerequisites.
- Review permissions, tool access, and skill allowlists whenever agent scope changes.
- Update pack README and registry metadata in the same change when components are added, moved, renamed, or removed.
- Keep prompts focused on stable guardrails, workflows, and referenced material.
</work_guidance>

## Verification

<verification>
- Run `python3 .opencode/skill/repo-maintenance/scripts/audit_repo.py` to validate structure and configuration.
- Run `python3 .opencode/skill/repo-maintenance/scripts/sync_docs.py` to check inventory and documentation alignment.
- Pack review MUST confirm README and registry entries resolve to existing files and least-privilege settings match stated roles.
</verification>

## Child DOX Index

<child_dox_index>
No direct child `AGENTS.md` files are currently owned.
</child_dox_index>
