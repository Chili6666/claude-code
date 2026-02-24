#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const command = process.argv[2];
const availableCommands = ['commit', 'organize-imports', 'check-memoization'];

if (!command || !availableCommands.includes(command)) {
  console.log('Usage: npx github:Chili6666/claude-code <command>');
  console.log('Available commands:', availableCommands.join(', '));
  process.exit(1);
}

const src = path.join(__dirname, '..', 'commands', `${command}.md`);
const destDir = path.join(process.cwd(), '.claude', 'commands');
const dest = path.join(destDir, `${command}.md`);

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log(`✓ Installed /${command} → ${dest}`);
