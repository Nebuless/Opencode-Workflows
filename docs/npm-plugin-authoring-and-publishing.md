# npm Plugin Authoring and Publishing

This guide defines npm package workflow for plugins in this repository.

<instructions>
## Package Isolation

Each `plugins/<plugin-name>/` directory MUST be an independent npm package.
Each package MUST own its `package.json`, version, dependencies, scripts, README,
exported files, and `publishConfig`.

The repository root MUST NOT be treated as an npm package or a publish target.
Maintainers MUST NOT run `npm publish` from repository root. Root
`.opencode/package.json` supports repository tooling; it is not plugin release
metadata.
</instructions>

<workflow>
## Author a Plugin

1. Create `plugins/<plugin-name>/`.
2. Add `package.json` with a unique npm name, `version`, ESM entry point,
   `files` allowlist, `repository.directory`, and `publishConfig.access`.
3. Add package README with installation, configuration, authentication,
   verification, security, and upgrade instructions.
4. Include every runtime dependency in the package metadata. Keep type-only
   imports in `devDependencies` when runtime resolution does not need them.
5. Add only source files required by the published entry point to `files`.

Use explicit package commands to prevent targeting another plugin:

```sh
npm --prefix plugins/<plugin-name> run <script>
npm --prefix plugins/<plugin-name> pack --dry-run
```

## Prepare Release

1. Select a new SemVer version. Published npm versions are immutable and MUST
   NOT be reused.
2. Update `plugins/<plugin-name>/package.json` and every README installation
   pin to the same version.
3. Run package-specific tests or self-checks and a local OpenCode smoke test.
4. Run `npm --prefix plugins/<plugin-name> pack --dry-run`.
5. Inspect tarball file list. It MUST include every runtime file and MUST NOT
   include credentials, environment files, unrelated plugins, repository files,
   caches, or generated artifacts.
6. Run `npm --prefix plugins/<plugin-name> publish --dry-run`.

Dry runs validate package payload and registry authorization. They do not prove
runtime behavior. Record actual smoke-test results before release approval.

## Publish

Publishing has external, immutable effects. A maintainer MUST obtain explicit
release approval before publishing. The maintainer MUST use an authorized npm
account and provide an OTP when npm requires two-factor authentication.

For public scoped packages:

```sh
npm --prefix plugins/<plugin-name> publish --access public --otp=<code>
```

`publishConfig.access: "public"` can supply access mode. Keep `--access public`
when clarity matters. Never put an OTP, npm token, or API key in source,
documentation, or commits.

## Verify Published Release

1. Check registry metadata:

   ```sh
   npm view <package>@<version> version
   npm view <package>@<version> dist-tags
   ```

2. Start OpenCode with clean configuration referencing exact
   `<package>@<version>`.
3. Verify plugin startup, expected provider or command registration, and a
   representative runtime operation.
4. Publish release notes only after registry and runtime verification pass.
</workflow>

<example>
## 9Router Example

`plugins/9router/` publishes independently as
`@nebulesstech/opencode-9router`. Version and publish payload are defined by
`plugins/9router/package.json`.

For version `0.1.1`:

```sh
npm --prefix plugins/9router run selfcheck -- http://localhost:20128/v1
npm --prefix plugins/9router run pack:check
npm --prefix plugins/9router publish --dry-run
npm --prefix plugins/9router publish --access public --otp=<code>
npm view @nebulesstech/opencode-9router@0.1.1 version
npm view @nebulesstech/opencode-9router@0.1.1 dist-tags
```

9Router package payload is `index.ts`, `thinking.ts`, `README.md`, and npm's
required `package.json`. `selfcheck.ts` and local `opencode.json` stay in the
repository and MUST NOT be published. Each future release MUST use a new version
in both package metadata and user-facing installation pins.
</example>

<checklist>
## Release Checklist

- [ ] Target is `plugins/<plugin-name>/`, not repository root.
- [ ] Package name and new version are correct.
- [ ] README package pins match `package.json`.
- [ ] Tests, self-checks, and OpenCode smoke test pass.
- [ ] `npm pack --dry-run` payload is reviewed.
- [ ] `npm publish --dry-run` passes.
- [ ] Explicit release approval exists.
- [ ] npm account and OTP are available.
- [ ] Registry metadata and clean-install runtime verification pass after publish.
</checklist>
