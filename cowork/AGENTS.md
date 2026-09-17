<purpose>
## Purpose
- `cowork/` provides multi-agent workflows for research, data, documents, presentations, coordination, and verified artifact delivery through a structured vault.
</purpose>

<ownership>
## Ownership
- Orchestrator MUST manage multi-step work and own plans, timelines, and file routing.
- Specialists MUST own single-domain artifacts and their verification, then report results to orchestrator.
- Admin assistant MUST own hygiene, coordination, and follow-ups.
</ownership>

<local-contracts>
## Local Contracts
- Agents MUST read `vault/01-Core-Identity/MASTER-STYLE-GUIDE.md` before producing artifacts.
- Agents MUST use `vault/01-Core-Identity/` for identity and style, `vault/02-Active-Work/YYYY-MM/Project-Name/` for current projects, `vault/03-Research-Intel/` for topic or company research, `vault/05-Output-Staging/` for verified deliverables, and `vault/06-Archive/` for closed work.
- Agents MUST ground claims in files or sources and MUST cite source URLs or file paths for key claims.
- Agents MUST verify outputs before staging them.
- Agents MUST keep `cowork/LESSONS-LEARNED.md` minimal and deduplicated.
- Agents MUST avoid boilerplate, filler, generic introductions, generic closings, hedging, excessive caveats, emojis, em dashes, and semicolons.
- Each request MUST produce concrete outputs or decisions.
</local-contracts>

<work-guidance>
## Work Guidance
- Each cycle SHOULD apply one small, documented improvement when evidence supports it.
- Agents MUST consolidate lessons instead of appending duplicates.
- Handoffs MUST include context with task summary and intended outcome, inputs with file paths, sources, and constraints, outputs with file types and target paths, verification with required manual, visual, or lint checks, and dependencies with blockers or timing constraints.
- Status updates MUST use 3P: Progress, Plans, Problems.
</work-guidance>

<verification>
## Verification
- Maintainers MUST run `/audit-repo` to validate repository structure and configuration when Cowork contracts or configuration change.
- Maintainers MUST run `/sync-docs` to check repository inventory and documentation drift when Cowork structure or documented inventory changes.
- Artifact owners MUST inspect every deliverable manually for content, source grounding, style-guide compliance, and correct vault placement before staging.
- Artifact owners MUST render and visually inspect layout-dependent outputs, including PDF and PPTX files, before staging.
- Artifact owners MUST run artifact-specific lint or validation checks when available and record completed checks in the handoff.
</verification>

<child-dox-index>
## Child DOX Index
- None. Vault lifecycle buckets are storage stages, not independently maintained boundaries.
</child-dox-index>
