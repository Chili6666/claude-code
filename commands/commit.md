---
name: commit
description: Automate git commit workflow with user confirmation, prefix selection, and optional push
version: 1.0.2
type: command
track_metrics: false
last_updated: 2026-01-13
rationale: "Creating good git commits requires analyzing changes, writing clear messages, following conventions, and deciding on branching strategy. This command automates the entire workflow - from change analysis to commit message generation to optional pushing - while giving users control over branching decisions and commit prefixes."
use_cases: "Use when you've made code changes and want guided commit creation, when you need help writing conventional commit messages (feat:, fix:, etc.), when deciding whether to create a feature branch or commit directly, or when you want to commit and push in one streamlined workflow."
dependencies: []
---

# Commit Command

Automate the git commit workflow by analyzing changes, creating concise commit messages, and optionally pushing to remote.

## Step 0: Check Git Status

1. Run `git status` to verify there are staged or unstaged changes
2. If no changes found, inform user: "No changes to commit." and EXIT
3. Run `git diff --stat` to get overview of changes
4. Run `git diff` to see detailed changes (limit to relevant files if many changes)
5. Run `git branch --show-current` to get current branch name

## Step 1: Branch Selection (Optional)

**Use AskUserQuestion to ask about branch creation:**

- Question: "You are on branch '[current-branch]'. Where would you like to commit?"
- Options:
  - "Stay on current branch" - Commit directly to current branch
  - "Create new branch" - Create a feature branch for the changes (recommended if main/master is protected)

**If user selects "Create new branch":**
- Ask for branch name or suggest one based on changes (e.g., `feat/add-login`, `fix/button-style`)
- Create and switch to the new branch: `git checkout -b [branch-name]`
- Confirm branch creation to user

**If user selects "Stay on current branch":**
- Proceed on current branch
- Warn if on main/master: "Note: You're committing directly to [main/master]"

## Step 2: Analyze Changes

Use the Read tool to examine modified files if needed for context. Review the changes and create a commit message:

1. Identify the nature of changes (new feature, bug fix, refactor, etc.)
2. Summarize key changes concisely (max 5 sentences, "kurz und knapp")
3. If changes are complex and would need more than 5 sentences to describe:
   - Present your best summary suggestion
   - Ask user: "The changes are complex. Here's my suggested summary - would you like to provide more context?"

## Step 3: Select Commit Prefix

Use AskUserQuestion to determine the commit type:

- Question: "What type of change is this?"
- Options:
  - "feat:" - A new feature or functionality
  - "fix:" - A bug fix or correction

## Step 4: Present Commit Message for Confirmation

1. Construct the full commit message with selected prefix
2. Present to user: "Proposed commit message:"
3. Show the complete message

Use AskUserQuestion to confirm:

- Question: "Is this commit message okay?"
- Options:
  - "Yes, use this message" - Proceed with the message
  - "No, I want to edit it" - User provides modified message

If user wants to edit, capture their revised message.

## Step 5: Choose Push Option

Use AskUserQuestion to determine push preference:

- Question: "Would you like to push after committing?"
- Options:
  - "Commit and push" - Commit changes and push to remote
  - "Commit only" - Only commit, do not push

## Step 6: Execute Git Operations

1. Stage all changes: `git add -A`
2. Create commit with the confirmed message
3. If user selected "Commit and push":
   - Push to remote: `git push`
   - If no upstream is set, push with upstream tracking: `git push -u origin` (current branch)
4. Run `git status` to confirm success

## Step 7: Present Summary

Display final status:

- Commit hash and message
- Branch name
- Push status (if applicable)
- Number of files changed

## Error Handling

- No changes to commit: Inform user and exit gracefully
- Git not initialized: Display error "Not a git repository" and exit
- Push fails: Show error message, suggest setting upstream branch
- Commit fails: Display git error message for user to resolve

## Notes

- Commit messages are in English
- Keep messages concise - max 5 sentences
- Always ask for confirmation before committing
- Never force push or skip hooks unless explicitly requested
- Use HEREDOC format for multi-line commit messages