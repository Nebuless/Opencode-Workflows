# Purpose

<purpose>
This directory owns current, source-backed contributor and release guides.
</purpose>

# Ownership

<ownership>
- Guides MUST describe repository workflows and release practices owned by their referenced source files.
- Package-specific facts MUST remain owned by the matching package metadata and README.
</ownership>

# Local Contracts

<local-contracts>
- Links, commands, package names, versions, paths, and examples MUST match the source they describe.
- Documentation MUST NOT contain secrets, tokens, API keys, passwords, or one-time passwords (OTP).
- Release instructions MUST preserve approval and package-isolation requirements from the root contract.
</local-contracts>

# Work Guidance

<work-guidance>
- Authors SHOULD verify each technical claim against current repository files before editing.
- Examples SHOULD use explicit placeholders for user-supplied values.
- Stale instructions MUST be corrected or removed when owned source changes.
</work-guidance>

# Verification

<verification>
- Changes MUST be checked with `/audit-repo` and `/sync-docs` when relevant.
</verification>

# Child DOX Index

<child-dox-index>
</child-dox-index>
