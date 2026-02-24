---
name: start-interviewing
description: Interview the user in plan mode and generate a structured plan document (project or feature)
version: 1.0.0
type: command
last_updated: 2026-02-24
---

# Start Interviewing Command

Enter plan mode, interview the user to collect context, then generate a structured plan document.
Supports two plan types: **Project Plan** and **Feature Plan**.

## Step 1: Enter Plan Mode

Call `EnterPlanMode` immediately so the entire interview and planning process happens inside plan mode.

## Step 2: Ask Which Plan Type

Use `AskUserQuestion` to determine what to plan:

- Question: "What would you like to plan?"
- Options:
  - "Project Plan" — define the overall project (purpose, features, tech stack, qualities)
  - "Feature Plan" — define a single feature within an existing project

## Step 3: Run the Interview

Always conduct the interview in English. Ask up to 4 questions per turn.

---

### If "Project Plan" was selected

**Turn 1 — Overview & Purpose:**
- "What is this project? What problem does it solve?"
- "Who is it for — who are the users or stakeholders?"

**Turn 2 — Features & Tech:**
- "What are the core features? List the main things the project must do."
- "What technology stack will you use? (languages, frameworks, tools, hosting)"

**Turn 3 — Quality & References:**
- "What non-functional qualities matter most? (e.g. performance, UX, security, scalability)"
- "Are there related docs, APIs, or repos to reference?"

---

### If "Feature Plan" was selected

**Turn 1 — Feature Identity:**
- "What is the name of this feature?"
- "What problem does it solve, and who benefits from it? (user story or goal)"

**Turn 2 — Scope & Approach:**
- "What are the acceptance criteria — how do we know the feature is done?"
- "What is the intended technical approach? (components, APIs, data changes, etc.)"

**Turn 3 — Dependencies & Boundaries:**
- "Are there dependencies on other features, services, or third-party tools?"
- "What is explicitly out of scope for this feature?"

---

## Step 4: Exit Plan Mode for Approval

After collecting all answers, call `ExitPlanMode`. This surfaces the plan to the user for review and approval before any files are written.

In the plan, summarize what will be written to the output file using the sections defined in Step 5.

## Step 5: Write the Plan Document

On user approval, create the appropriate file using the `Write` tool.

---

### Project Plan → `docs/PROJECT_PLAN.md`

```markdown
# Project Plan

## Overview
[One-paragraph summary of what the project is and what it does]

## Purpose
[The problem it solves and who benefits from it]

## Core Features
[Bullet list of the core features and capabilities]

## Technology Stack
[Languages, frameworks, libraries, tools, and hosting]

## Key Qualities
[Key non-functional qualities: performance, UX, security, scalability, etc.]

## Related Documents
[Links or references to related docs, APIs, repos, or external resources]
```

---

### Feature Plan → `docs/features/<feature-name>.md`

Use the feature name from the interview (lowercase, hyphenated) as the filename.

```markdown
# Feature Plan: <Feature Name>

## Goal
[The problem this feature solves and who benefits from it]

## Acceptance Criteria
[Bullet list — measurable conditions that define "done"]

## Technical Approach
[Components, APIs, data changes, or architectural decisions involved]

## Dependencies
[Other features, services, or third-party tools this feature relies on]

## Out of Scope
[What is explicitly not part of this feature]
```

---

## Notes

- Always enter plan mode first — the interview must happen inside plan mode
- Ask all topic areas before exiting plan mode
- Write the file only after the user approves the plan
- Keep each section concise and factual based on the user's answers
- Do not invent or assume information the user did not provide
- Feature plan files go into `docs/features/` — create the directory if needed
