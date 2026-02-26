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
- "What is this project? Give a brief overview of what it does."
- "What is the purpose of this project? What problem does it solve and who benefits?"

**Turn 2 — Functionality & Tech:**
- "What is the core functionality? Describe the main things the project must do."
- "What technology stack will you use? (languages, frameworks, libraries, tools, hosting)"

**Turn 3 — Features & References:**
- "What are the key features? List the most important capabilities and qualities."
- "Are there related documents, APIs, repos, or external resources to reference?"

---

### If "Feature Plan" was selected

**Turn 1 — Overview & Purpose:**
- "What is the name of this feature? Give a brief overview of what it does."
- "What is the purpose of this feature? What problem does it solve and who benefits?"

**Turn 2 — Functionality & Tech:**
- "What is the core functionality? Describe what this feature must do (acceptance criteria, behavior)."
- "What technology stack or technical approach is involved? (components, APIs, data changes, etc.)"

**Turn 3 — Features & References:**
- "What are the key features or sub-capabilities of this feature?"
- "Are there related documents, dependencies, or external resources to reference?"

---

## Step 4: Write the Plan to the Plan File

After collecting all answers, write the **full plan document content** (using the templates from Step 5) into the plan file that plan mode provides. This is the file the user will review.

The plan file MUST contain:
1. The complete plan document exactly as it will be saved (using the templates below)
2. A final section titled `## Output` stating the target file path where the document will be written

Then call `ExitPlanMode` to surface the plan for user review and approval.

## Step 5: Write the Plan Document to `docs/`

**CRITICAL**: After the user approves the plan, the FIRST action must be writing the plan document to the `docs/` folder using the `Write` tool. Do NOT proceed to any implementation work until the plan file has been written.

Target paths:
- Project Plan → `docs/PROJECT_PLAN.md`
- Feature Plan → `docs/features/<feature-name>.md` (create directory if needed)

---

### Project Plan → `docs/PROJECT_PLAN.md`

```markdown
# Project Plan: <Project Name>

## Project Overview
[One-paragraph summary of what the project is and what it does]

## Purpose
[The problem it solves and who benefits from it]

## Core Functionality
[Bullet list of the core functionality and what the project must do]

## Technology Stack
[Languages, frameworks, libraries, tools, and hosting]

## Key Features
[Bullet list of the most important capabilities, qualities, and features]

## Related Documents
[Links or references to related docs, APIs, repos, or external resources]
```

---

### Feature Plan → `docs/features/<feature-name>.md`

Use the feature name from the interview (lowercase, hyphenated) as the filename.

```markdown
# Feature Plan: <Feature Name>

## Project Overview
[One-paragraph summary of what this feature is and what it does]

## Purpose
[The problem this feature solves and who benefits from it]

## Core Functionality
[Bullet list of the core functionality — what the feature must do, acceptance criteria, behavior]

## Technology Stack
[Components, APIs, data changes, technical approach, or architectural decisions involved]

## Key Features
[Bullet list of sub-capabilities, key qualities, or important aspects of this feature]

## Related Documents
[Dependencies, related features, services, external resources, or reference docs]
```

---

## Notes

- Always enter plan mode first — the interview must happen inside plan mode
- Ask all topic areas before exiting plan mode
- **After approval, IMMEDIATELY write the plan document to `docs/` before doing anything else**
- The plan document is the sole deliverable of this command — do not start implementation
- Keep each section concise and factual based on the user's answers
- Do not invent or assume information the user did not provide
- Feature plan files go into `docs/features/` — create the directory if needed
