---
name: plan-phases
description: Read a project or feature plan and generate a structured implementation plan with phases
version: 1.0.0
type: command
last_updated: 2026-02-24
---

# /plan-phases

Read an existing project or feature plan document, interview the user about constraints and phase
structure, then generate a professional implementation plan using Claude Code's plan mode.

The output filename is derived from the source plan type:
- Project plan → `docs/IMPLEMENTATION_PLAN.md`
- Feature plan → `docs/FEATURE_IMPL_PLAN.md` (or `docs/<FeatureName>_IMPL_PLAN.md` if the feature name is clear from the document)

---

## Step 1 — Enter Plan Mode

Call `EnterPlanMode` immediately upon invocation.

---

## Step 2 — Resolve the Plan Document

The user may pass the plan filename as an argument when invoking the command
(e.g. `/plan-phases PROJECT_PLAN.md` or `/plan-phases features/auth.md`).

**If a filename argument was provided:**
- Look for it in `docs/` (e.g. `docs/PROJECT_PLAN.md`)
- Read it with the `Read` tool

**If no argument was provided:**
- Use `AskUserQuestion` with the question:
  > "Which plan document should I base the implementation plan on?"
- Dynamically list any `.md` files found in `docs/` and `docs/features/` as options
- If no docs exist at all, inform the user and exit:
  > "No plan documents found in `docs/`. Create one first with `/start-interviewing`."

After resolving the plan file, also read `CLAUDE.md` from the project root if it exists — it
provides conventions, stack, build commands, and known issues that inform the generated plan.

**Determine the output filename** by inspecting the source plan:
- If the plan covers the full project → output file: `docs/IMPLEMENTATION_PLAN.md`
- If the plan covers a single feature → output file: `docs/FEATURE_IMPL_PLAN.md`
  (if a specific feature name is clear from the document, prefer `docs/<FeatureName>_IMPL_PLAN.md`,
  e.g. `docs/AUTH_IMPL_PLAN.md`)

Use this resolved output filename consistently in all subsequent steps.

---

## Step 3 — Interview: Constraints & Phases

Conduct the interview in **two turns** using `AskUserQuestion`.

**Turn 1 — Constraints:**
Ask both of these questions together:
- "What implementation constraints apply? (e.g. CSS-only, no external libraries, specific patterns required, mock-only data, etc.)"
- "Are there any hard prohibitions — things Claude must NOT do during implementation?"

**Turn 2 — Phases:**
Ask both of these questions together:
- "How many implementation phases do you want, and what should each phase cover? (e.g. 4 phases: Foundation / Layout / Components / Integration)"
- "What verification commands should run at the end of each phase? (e.g. `npm run build`, `npx eslint src/`, `tsc --noEmit`)"

---

## Step 4 — Exit Plan Mode for Approval

Call `ExitPlanMode`. In the plan file written before exiting, show the proposed output filename
and skeleton (e.g. `docs/IMPLEMENTATION_PLAN.md` or `docs/AUTH_IMPL_PLAN.md`):
- Section list
- Phase names and brief scope descriptions
- Constraint table rows (derived from user answers + CLAUDE.md)
- Verification commands per phase

Wait for user approval before generating the final file.

---

## Step 5 — Generate the Implementation Plan

On approval, write the output file (resolved in Step 2) using the structure below.
**Adapt sections to the project's tech stack** — omit sections that clearly don't apply
(e.g. omit "CSS Variables Specification" for a backend-only project).

### Output Structure

```markdown
# Implementation Plan: <Name from plan doc>

## Table of Contents
- [1. Constraints](#1-constraints)
- [2. Project Structure](#2-project-structure)
- [3. Interfaces / Type Definitions](#3-interfaces--type-definitions)
- [4. CSS Variables Specification](#4-css-variables-specification)
- [5. Component Specifications](#5-component-specifications)
- [6. Implementation Phases](#6-implementation-phases)
- [7. Critical Files](#7-critical-files)
- [8. Task Checklist](#8-task-checklist)
- [9. Verification Steps](#9-verification-steps)
- [Related Documents](#related-documents)

---

## 1. Constraints
| Constraint | Description |
|------------|-------------|
| ...        | ...         |

---

## 2. Project Structure
[Full file tree — all files to be created or modified]

---

## 3. Interfaces / Type Definitions
[Key interfaces/types — one fenced code block per file, with JSDoc where appropriate]

---

## 4. CSS Variables Specification
[`:root` block with all variables — colors, spacing, shadows, component-specific tokens]

---

## 5. Component Specifications
[One entry per component: props, state, key responsibilities, notable behaviors]

---

## 6. Implementation Phases

### Phase N: <Name>
[Numbered task list]

[ASCII layout diagram if this is a layout/structural phase]

**End of Phase Expectations:**
1. Create `docs/plans/phase<N>.md` documenting what was implemented
2. Run: `<verification commands from user>`
3. Stop here. Do not start with the next phase.

[Repeat for each phase]

---

## 7. Critical Files
[Table per phase: File | Action (Create / Modify)]

---

## 8. Task Checklist
[Checkbox list per phase]

---

## 9. Verification Steps
1. Start dev server / run app
2. Visual / functional checks per feature
3. Build + lint commands

---

## Related Documents
[Links to source plan doc, CLAUDE.md, design refs]
```

### Adaptation Rules

- **Constraints**: Derive rows from user answers (Turn 1) + relevant rules found in `CLAUDE.md`
- **Project Structure**: Derive from the plan's feature/component list and tech stack
- **Interfaces / Type Definitions**: Infer from data entities described in the plan
- **Phases**: Use the user's phase breakdown from Turn 2 exactly as specified
- **End of Phase block**: Every phase section must end with the standard "End of Phase Expectations"
  block, including the instruction to create `docs/plans/phase<N>.md` and then stop
- **Phase docs folder**: Phase summary files go into `docs/plans/`
- **CSS Variables**: Include only for frontend/UI projects
- **Component Specifications**: Include only when the plan describes components or UI elements
