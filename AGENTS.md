## Repository Overview

This is the **Opencode Workflows** repository - a collection of Opencode-based command templates and workflow patterns for building sophisticated command-based projects. The repository contains multiple workflow examples and templates that demonstrate different approaches to command architecture and tool integration.

<instructions>
## Verification Commands
This is a **workflow repository**, not a traditional application. Verification focuses on repository integrity and structural validity.

- **Audit Repository**: `/audit-repo` (Validates structure and configs via `audit_repo.py`)
- **Sync Documentation**: `/sync-docs` (Reports inventory and suggests doc updates via `sync_docs.py`)
- **Full Maintenance**: `/maintain-repo` (Runs full audit and sync cycle)

**Note**: There are no traditional `npm test`, `cargo build`, or `tsc` commands at the root level.
</instructions>

<rules>
## Process Constraints
- MUST NOT run long-running/blocking processes (dev servers, watch modes)
- Dev servers/background processes are USER's responsibility
- MUST use one-shot commands for verification (audit, sync, scripts)

## Coding Conventions
- **RFC 2119**: MUST use uppercase keywords (MUST, SHOULD, MAY) for requirements in agents and commands.
- **XML Structure**: MUST use XML tags (`<instructions>`, `<rules>`, etc.) to wrap logic blocks.
- **Modularity**: Files SHOULD NOT exceed 200 lines; functions SHOULD NOT exceed 40 lines.
- **Barrel Files**: Every module directory MUST have an `index.ts` (per `@coding-ts` guidelines).
</rules>

<publishing>
## npm Plugin Authoring and Publishing
- Each plugin directory that owns package metadata MUST be treated as an independent npm package.
- Maintainers MUST run build, validation, packing, and publishing commands from the target plugin directory.
- Maintainers MUST NOT publish from repository root.
- Maintainers MUST follow [npm Plugin Authoring and Publishing](docs/npm-plugin-authoring-and-publishing.md).
</publishing>

## Current Workflows

### Agent Templates Catalog
A focused collection of reusable agent prompts and orchestration patterns:
- **repo-maintainer**: Repository health custodian (audits, doc sync). **NOTE: This root agent is specific to the Opencode-Workflows repo.**
- **fast**: High-speed workhorse for trivial edits, running known commands, and simple file lookups.
- **smart**: Senior developer and architect for complex bug hunting, codebase refactoring, and verified implementation.
- **repo-navigator-creator**: Produces lean AGENTS.md navigation guides
- **subagent-orchestrator**: Dispatches specialized agents and manages execution plans
- **openspec-orchestrator**: Enforces strict OpenSpec formatting/validation and orchestrates subagents

Agents are designed for global installation in `~/.config/opencode/agent/` for reuse across projects.

## Working with This Repository

### For Template Usage
1. Review available workflow templates in agents/ and commands/
2. Copy template elements selectively for your projects
3. Create your own `opencode.json` based on examples
4. Adapt commands and tools to specific needs
5. Install desired agents globally in `~/.config/opencode/agent/` for reuse across projects

### For Agent Usage
- Agents are designed for global installation but can be copied to project-specific `.opencode/agent/` directories
- Check YAML frontmatter to understand when to use each agent and any tool constraints
- Agents complement commands by providing specialized reasoning, research, or coordination
- Reference the relevant agent file before acting to respect mode and tool constraints

### For Workflow Development
- Commands follow Opencode `/commands` rules and patterns
- External tools should handle errors gracefully
- Documentation maintenance via specialized agents
- Model compatibility considerations for context management

## Future Development

This repository is designed to expand with additional workflow templates and patterns. Future workflows may include:
- Different command architectures and integration patterns
- Additional external tool integrations
- Alternative documentation systems
- Enhanced model compatibility patterns
- More specialized agent templates for different domains

## Key Insights

- This is a **workflow repository**, not a traditional application - no build/test/lint commands
- Focus on **reusable patterns** and **template architectures**
- Commands follow **Opencode standards** for compatibility
- Context injection currently limited to session-start (future enhancement possible)

# DOX framework

- DOX is highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products, source materials, instructions, records, assets, and durable docs must stay understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it

## Read Before Editing

1. Read the root AGENTS.md
2. Identify every file or folder you expect to touch
3. Walk from the repository root to each target path
4. Read every AGENTS.md found along each route
5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that child and continue from there
6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules
7. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX

Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child index changes. Update child docs when parent changes alter local rules. Remove stale or contradictory text immediately. Small edits that do not change behavior or contracts may leave docs unchanged, but the DOX pass still must happen.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable workflow rules, and the top-level Child DOX Index
- Child AGENTS.md files own domain-specific instructions and their own Child DOX Index
- Each parent explains what its direct children cover and what stays owned by the parent
- The closer a doc is to the work, the more specific and practical it must be

## Child Doc Shape

- Create a child AGENTS.md when a folder becomes a durable boundary with its own purpose, rules, responsibilities, workflow, materials, or quality standards
- Work Guidance must reflect the current standards of the project or user instructions; if there are no specific standards or instructions yet, leave it empty
- Verification must reflect an existing check; if no verification framework exists yet, leave it empty and update it when one exists

Default section order:
- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs and concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across many files unless each scope needs a local version
- Delete stale notes instead of explaining history
- Trim obvious statements, repeated rules, misplaced detail, and warnings for risks that no longer exist

## Closeout

1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and any affected parents or children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant
6. Report any docs intentionally left unchanged and why

## User Preferences

When the user requests a durable behavior change, record it here or in the relevant child AGENTS.md

## Child DOX Index

- [`.opencode/AGENTS.md`](.opencode/AGENTS.md): Repository-specific maintenance tooling.
- [`agents/AGENTS.md`](agents/AGENTS.md): Reusable agent packs and their shipped components.
- [`commands/AGENTS.md`](commands/AGENTS.md): Standalone command templates and catalog metadata.
- [`cowork/AGENTS.md`](cowork/AGENTS.md): Cowork workflows, artifact staging, and vault lifecycle.
- [`docs/AGENTS.md`](docs/AGENTS.md): Source-backed contributor and release guides.
- [`mcp-configs/AGENTS.md`](mcp-configs/AGENTS.md): Copyable MCP configuration examples.
- [`9router-gpt-only/AGENTS.md`](9router-gpt-only/AGENTS.md): Portable 9Router GPT-only presets and contract checker.
- [`plugins/AGENTS.md`](plugins/AGENTS.md): Plugin sources and independent package-release boundaries.
- [`scripts/AGENTS.md`](scripts/AGENTS.md): One-shot repository automation.

Root retains ownership of `README.md`, `registry.json`, `registry.toml`,
`RFC-XML-STYLE-GUIDE.md`, `at/`, `commands2skills/`, and
`thinking-variants config/`, which contains only generic thinking-level
examples. `9router-gpt-only/` owns portable 9Router GPT-only presets and its
contract verifier. Its presets MUST remain strict JSON, portable, secret-free,
and MUST NOT replace dynamic 9Router discovery with static provider models.
