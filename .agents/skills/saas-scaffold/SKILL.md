---
name: saas-scaffold
description: Build a SaaS MVP block-by-block from a task document: scaffold, implement each block, verify builds, and track progress.
---

Implement a SaaS application step-by-step from a task document (`tareas.md` or similar).

## Pre-requisites

- A task document with numbered blocks and specific sub-tasks (e.g., `tareas.md`).
- A PRD or implementation doc describing the desired application.

## Steps

### Phase 0 — Read & plan
1. Read the task document fully. Count total blocks and tasks.
2. Read the PRD/implementation doc for context.
3. Create a todo list for the current block using TodoWrite.

### Phase 1 — Scaffold (if needed)
1. Initialize the project (e.g., `npx create-next-app@latest` with appropriate flags).
2. Install core dependencies (database driver, types, UI libraries).
3. Create the folder structure as specified in the task document.
4. Verify the project compiles: `npm run build`.
5. If scaffolded in a temp directory, move files to the target directory and clean up.

### Phase 2 — Block-by-block implementation
For each block in the task document:

1. **Create tasks** — Use TaskCreate for each sub-task with descriptive subject and activeForm.
2. **Implement** — For each sub-task:
   - Mark task in_progress (TaskUpdate).
   - Read existing files before editing.
   - Write/Edit files as needed.
   - Run `npm run build` or equivalent to verify compilation.
   - Mark task completed (TaskUpdate).
3. **Update the task document** — Edit `tareas.md` to mark completed blocks (add checkmarks or status notes).
4. **Verify** — Run the dev server briefly to confirm the app starts, then stop it.

### Phase 3 — Verification
1. Run a full build for the project.
2. If a dev server is needed for visual verification, start it, take a screenshot or curl the endpoint, then stop it.
3. Report the summary of what was built.

## Conventions

- Always `Read` a file before `Edit` or `Write` to it.
- Use `Bash` with `npm run build` after each block to catch errors early.
- Use TodoWrite for visible progress tracking across the full session.
- Prefer creating the project in the target directory directly. If the directory has existing files, scaffold in a temp dir and copy config files only (skip `node_modules`).
- Use `--yes` or `--use-npm` flags to avoid interactive prompts.

## Stopping condition

All blocks in the task document are implemented, the project builds cleanly, and the task document is updated to reflect completion status.
