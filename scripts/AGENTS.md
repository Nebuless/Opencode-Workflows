# Purpose

<purpose>
This directory owns one-shot repository automation scripts.
</purpose>

# Ownership

<ownership>
- Each script MUST define its inputs, outputs, and side effects clearly in code or adjacent documentation.
- Scripts MUST remain scoped to the repository task they automate.
</ownership>

# Local Contracts

<local-contracts>
- Scripts MUST NOT embed machine-specific paths or print secrets, tokens, passwords, cookies, or session data.
- File-changing scripts MUST protect unrelated content and limit writes to declared targets.
- Destructive or external side effects MUST be explicit before execution.
</local-contracts>

# Work Guidance

<work-guidance>
- Authors SHOULD prefer one-shot, non-interactive behavior with clear failure messages.
- Input assumptions and required tools MUST stay visible near entry points.
- Changes MUST preserve unrelated user configuration and repository files.
</work-guidance>

# Verification

<verification>
- Changes MUST be checked with `/audit-repo` and `/sync-docs` when relevant.
</verification>

# Child DOX Index

<child-dox-index>
</child-dox-index>
