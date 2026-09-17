# Purpose

<purpose>
This directory owns copyable MCP configuration examples and their supporting helpers.
</purpose>

# Ownership

<ownership>
- Each example directory MUST keep its README, configuration examples, and helper files aligned.
- Runtime-specific behavior MUST be documented beside the example that provides it.
</ownership>

# Local Contracts

<local-contracts>
- Configuration examples and helpers MUST remain copyable after documented substitutions.
- Machine-specific paths, ports, browser profiles, account data, and secrets MUST use clear placeholders unless they are documented portable defaults.
- Examples MUST NOT include live credentials, cookies, tokens, passwords, or session data.
- README commands and configuration snippets MUST match the files users copy.
</local-contracts>

# Work Guidance

<work-guidance>
- Authors SHOULD keep setup steps explicit and preserve security warnings for authenticated sessions.
- Platform assumptions and required substitutions MUST be stated near affected examples.
- Helper changes SHOULD avoid hidden machine dependencies.
</work-guidance>

# Verification

<verification>
- Changes MUST be checked with `/audit-repo` and `/sync-docs` when relevant.
</verification>

# Child DOX Index

<child-dox-index>
</child-dox-index>
