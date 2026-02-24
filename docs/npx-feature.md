# Plan: npx Installer for Claude Commands

## Context

The `commands/` directory contains Claude Code slash command definitions (`.md` files) that need to be installable on other machines via a simple npx one-liner. The install target is project-local (`./.claude/commands/` in the current working directory). A future `setup` subcommand will copy multiple files/folders into `.claude/`, but the architecture should accommodate that from the start.

## Approach

Create a minimal npm package in the repo root (no CLI framework, plain Node.js). Users run:

```
npx github:Chili6666/claude-code commands add commit
npx github:Chili6666/claude-code commands add organize-imports
npx github:Chili6666/claude-code commands add check-memoization
```

The `commands` argument is the target type (maps to `.claude/commands/`). Future support for `skills` would map to `.claude/skills/` following the same pattern as `npx skills add`.

No npm publish required — `npx github:user/repo` fetches directly from GitHub.

---

## Files to Create / Modify

### 1. `package.json` (new)

```json
{
  "name": "claude-code-commands",
  "version": "1.0.0",
  "description": "Claude Code custom command installer",
  "bin": {
    "claude-code-commands": "bin/install.js"
  },
  "files": ["bin/", "commands/"],
  "engines": { "node": ">=16" }
}
```

- `bin` maps the executable name to the script
- `files` ensures only the installer + commands are bundled (not HTML docs, `.git`, etc.)

### 2. `bin/install.js` (new)

Plain Node.js script, no dependencies:

```js
#!/usr/bin/env node
// See bin/install.js for the full implementation
// CLI: npx github:Chili6666/claude-code <target> add <name>
// e.g. npx github:Chili6666/claude-code commands add commit
```

Key design choices:
- `process.cwd()` resolves `./.claude/` relative to where the user runs the command (project-local)
- `fs.mkdirSync(..., { recursive: true })` creates `.claude/commands/` if it doesn't exist
- Explicit allowlist of command names — easy to extend when new `.md` files are added

---

## Future Extensions

To add `skills` support, add a `skills` entry to the `TARGETS` map in `bin/install.js`:

```js
skills: {
  available: ['my-skill'],
  srcDir: 'skills',
  destDir: path.join('.claude', 'skills'),
  ext: '.md',
},
```

Users would then run `npx github:Chili6666/claude-code skills add my-skill`, consistent with the `npx skills add` convention.

---

## Directory Structure After Implementation

```
claude-code/
├── bin/
│   └── install.js        ← new
├── commands/
│   ├── commit.md
│   ├── check-memoization.md
│   └── organize-imports.md
├── package.json          ← new
├── index.html
└── howto.html
```

---

## Verification

1. On target machine, `cd` into any project
2. Run `npx github:Chili6666/claude-code commands add commit`
3. Confirm `.claude/commands/commit.md` was created in the current directory
4. Open Claude Code in that project — `/commit` should appear as a slash command
