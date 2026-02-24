# claude-code-commands

Install Claude Code slash commands directly via `npx` – no manual copying required.

## Usage

```bash
npx github:Chili6666/claude-code commands add <name>
```

Copies the selected command file into `.claude/commands/` of the current project.

## Available Commands

| Name | Description |
|------|-------------|
| `commit` | Git commit workflow: analyze changes, generate message, select prefix, optionally push |
| `organize-imports` | Group and sort imports in `.ts`/`.tsx` files alphabetically with section comments |
| `check-memoization` | Scan React components for unnecessary `useMemo`, `useCallback`, and `React.memo` usage |

## Examples

```bash
# Install the commit command
npx github:Chili6666/claude-code commands add commit

# Install the import organizer
npx github:Chili6666/claude-code commands add organize-imports

# Install the memoization checker
npx github:Chili6666/claude-code commands add check-memoization
```

After installation the command is available in Claude Code as `/commit`, `/organize-imports`, or `/check-memoization`.

## Requirements

- Node.js >= 16
- Claude Code CLI
