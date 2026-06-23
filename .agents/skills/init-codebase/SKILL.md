---
name: init-codebase
description: Analyze a codebase and generate a CLAUDE.md file with build commands, architecture, and conventions for future AI sessions.
---

Analyze the current project and generate a comprehensive `CLAUDE.md` file.

## Steps

1. **Discover project structure**
   - Use Glob to find `**/*`, `**/*.json`, `.cursor/rules/*`, `.cursorrules`, `.github/copilot-instructions.md`, any existing `CLAUDE.md` or `AGENTS.md`.
   - Read `package.json`, `tsconfig.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, or equivalent to identify the tech stack.

2. **Read planning documents** (if present)
   - Look for `prd.md`, `documentoImplementacion.md`, `README.md`, `docs/*`, `*.spec.md`.
   - Understand the project's purpose, scope, and target audience.

3. **Identify conventions**
   - Check for linting configs (`.eslintrc`, `.prettierrc`, `biome.json`).
   - Check for test frameworks and test file patterns.
   - Check for CI/CD configs (`.github/workflows/*`).
   - Note naming conventions from existing code (camelCase, snake_case, etc.).

4. **Write `CLAUDE.md`** with these sections:
   - **Project overview** — what it is, who it's for.
   - **Tech stack** — language, framework, database, key libraries.
   - **Build & run commands** — dev, build, lint, test (exact commands).
   - **Architecture** — directory structure, key patterns (monolith, modular, etc.).
   - **Conventions** — naming, imports, file organization.
   - **Important files** — entry points, config files, seed data.
   - **Known gotchas** — anything non-obvious about the project setup.

5. **If CLAUDE.md already exists**, read it first, compare against current state, and update only what changed. Do not overwrite existing sections unless they are stale.

## Stopping condition

`CLAUDE.md` is written or updated at the project root, covering build commands, architecture, and conventions.
